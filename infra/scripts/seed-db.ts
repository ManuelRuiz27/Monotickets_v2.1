import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_SUPERADMIN_EMAIL ?? 'superadmin@example.com';
  const password = process.env.SEED_SUPERADMIN_PASSWORD ?? 'changeme';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await argon2.hash(password);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.SuperAdmin
      }
    });
    console.log('Super admin created', email);
  } else {
    console.log('Super admin already exists');
  }

  const orgName = process.env.SEED_ORG_NAME ?? 'Org Demo';
  const orgAdminEmail = process.env.SEED_ORG_ADMIN_EMAIL ?? 'admin@orgdemo.test';
  const orgAdminPassword = process.env.SEED_ORG_ADMIN_PASSWORD ?? 'changeme';

  const existingOrg = await prisma.organization.findFirst({ where: { name: orgName } });
  if (!existingOrg) {
    const passwordHash = await argon2.hash(orgAdminPassword);
    await prisma.organization.create({
      data: {
        name: orgName,
        users: {
          create: {
            email: orgAdminEmail,
            passwordHash,
            role: UserRole.OrgAdmin
          }
        }
      }
    });
    console.log('Organization and admin created', orgName);
  } else {
    console.log('Organization already seeded');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
