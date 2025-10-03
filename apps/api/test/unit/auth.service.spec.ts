import 'reflect-metadata';
import { AuthService } from '../../src/auth/auth.service.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

const userFindUnique = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: userFindUnique
      }
    }))
  };
});

describe('AuthService', () => {
  const jwtService = new JwtService({ secret: 'test', signOptions: { expiresIn: '15m' } });
  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'config.refresh.expiresIn') {
        return '30d';
      }
      if (key === 'config.refresh.secret') {
        return 'secret';
      }
      return undefined;
    })
  } as unknown as ConfigService;
  const redisClient = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn()
  };
  const redisService = {
    getClient: () => redisClient
  } as any;
  const service = new AuthService(jwtService, configService, redisService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hashes passwords with argon2', async () => {
    const hash = await service.hashPassword('secret');
    expect(hash).not.toEqual('secret');
    const valid = await argon2.verify(hash, 'secret');
    expect(valid).toBe(true);
  });

  it('validates user credentials', async () => {
    const passwordHash = await argon2.hash('secret');
    userFindUnique.mockResolvedValueOnce({
      id: '1',
      email: 'test@example.com',
      passwordHash,
      role: 'Staff'
    });

    const user = await service.validateUser('test@example.com', 'secret');
    expect(user.email).toBe('test@example.com');
  });

  it('throws when credentials are invalid', async () => {
    userFindUnique.mockResolvedValueOnce(null);
    await expect(service.validateUser('bad@example.com', 'oops')).rejects.toThrow('Invalid credentials');
  });

  it('issues access and refresh tokens on login', async () => {
    const passwordHash = await argon2.hash('secret');
    userFindUnique.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      passwordHash,
      role: 'Staff'
    });

    const result = await service.login('test@example.com', 'secret');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toContain('.');
    expect(redisClient.set).toHaveBeenCalled();
  });
});
