import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, UserRole } from '@prisma/client';
import { RedisService } from '../common/infra/redis/redis.service.js';
import * as argon2 from 'argon2';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

type JwtUserPayload = { id: string; role: UserRole };

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }
  const value = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      throw new Error(`Unsupported duration unit: ${unit}`);
  }
}

@Injectable()
export class AuthService {
  private readonly refreshTtl: number;
  private readonly refreshSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService
  ) {
    const refreshExpiration = this.configService.get<string>('config.refresh.expiresIn', '30d');
    this.refreshTtl = parseDuration(refreshExpiration);
    this.refreshSecret = this.configService.get<string>('config.refresh.secret') ?? 'refresh-secret';
  }

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async validateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await argon2.verify(user.passwordHash, password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async generateAccessToken(user: JwtUserPayload) {
    const payload = { sub: user.id, role: user.role };
    return this.jwtService.signAsync(payload);
  }

  private async storeRefreshToken(userId: string, tokenId: string, token: string) {
    const client = this.redisService.getClient();
    const hash = await argon2.hash(token + this.refreshSecret);
    const key = `refresh:${userId}:${tokenId}`;
    await client.set(key, hash, 'EX', this.refreshTtl);
  }

  async generateRefreshToken(userId: string) {
    const tokenId = uuid();
    const token = uuid();
    await this.storeRefreshToken(userId, tokenId, token);
    return `${tokenId}.${token}`;
  }

  private async consumeRefreshToken(userId: string, tokenId: string, token: string) {
    const key = `refresh:${userId}:${tokenId}`;
    const client = this.redisService.getClient();
    const stored = await client.get(key);
    if (!stored) {
      throw new UnauthorizedException('Refresh token invalid');
    }
    const valid = await argon2.verify(stored, token + this.refreshSecret);
    if (!valid) {
      throw new UnauthorizedException('Refresh token invalid');
    }
    await client.del(key);
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const accessToken = await this.generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = await this.generateRefreshToken(user.id);
    return { accessToken, refreshToken, user };
  }

  async refresh(userId: string, refreshToken: string) {
    const [tokenId, tokenValue] = refreshToken.split('.');
    if (!tokenId || !tokenValue) {
      throw new UnauthorizedException('Refresh token malformed');
    }
    await this.consumeRefreshToken(userId, tokenId, tokenValue);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const newAccessToken = await this.generateAccessToken({ id: user.id, role: user.role });
    const newRefreshToken = await this.generateRefreshToken(user.id);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string, refreshToken: string) {
    const [tokenId] = refreshToken.split('.');
    if (!tokenId) {
      return;
    }
    const key = `refresh:${userId}:${tokenId}`;
    await this.redisService.getClient().del(key);
  }
}
