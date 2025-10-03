export type OrgId = string;
export type EventId = string;

export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  OrgAdmin = 'OrgAdmin',
  Staff = 'Staff'
}

export interface UserSummary {
  id: string;
  email: string;
  role: UserRole;
  orgId?: OrgId | null;
}
