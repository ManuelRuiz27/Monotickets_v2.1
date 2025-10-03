import { Injectable } from '@nestjs/common';
import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

@Injectable()
export class UsersService {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async createSuperAdmin(email: string, password: string) {
    const passwordHash = await argon2.hash(password);
    return prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.SuperAdmin
      }
    });
  }

  async createOrgWithAdmin(orgName: string, email: string, password: string) {
    const passwordHash = await argon2.hash(password);
    return prisma.organization.create({
      data: {
        name: orgName,
        users: {
          create: {
            email,
            passwordHash,
            role: UserRole.OrgAdmin
          }
        }
      },
      include: { users: true }
    });
  }
}
