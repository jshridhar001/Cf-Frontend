export interface LoginCredentials {
  email: string;
  password: string;
}

export type Role =
  | 'SUPER_DEVELOPER'
  | 'MANAGING_DIRECTOR'
  | 'PROGRAMME_MANAGER'
  | 'ACCOUNTS_SETTLEMENTS_MANAGER'
  | 'FIELD_OPERATIONS_MANAGER'
  | 'ACCOUNTS_SEEDS_SUPPLY_MANAGER'
  | 'FIELD_OFFICER'
  | (string & {});

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  role: Role;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  impersonatedBy: string | null;
}

export interface MeResponse {
  session: AuthSession;
  user: AuthUser;
}
