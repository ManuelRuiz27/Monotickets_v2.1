export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  OrgAdmin = 'OrgAdmin',
  Staff = 'Staff'
}

export class UserEntity {
  id!: string;
  email!: string;
  passwordHash!: string;
  role!: UserRole;
  orgId?: string | null;
  org?: {
    id: string;
    name: string;
  } | null;
  createdAt!: Date;
  updatedAt!: Date;
}
