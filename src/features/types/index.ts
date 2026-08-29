import type { Role } from '@/features/auth/types';

export type AccessControlUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: Role;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AccessControlUsersResponse = {
  success: boolean;
  data: AccessControlUser[];
};

export type AccessControlSessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type AccessControlSession = {
  id: string;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  user: AccessControlSessionUser;
};

export type AccessControlSessionsResponse = {
  success: boolean;
  data: AccessControlSession[];
};
