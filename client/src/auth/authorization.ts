import { jwtDecode } from 'jwt-decode';

import { AccountState, type JWTPayload } from '@/api/types';

export const getJwtPayload = (token?: string): JWTPayload | undefined => {
  if (!token) {
    return undefined;
  }

  return jwtDecode<JWTPayload>(token);
};

export const getAccountRole = (token?: string): AccountState => {
  return getJwtPayload(token)?.role ?? AccountState.NORMAL;
};

export const canAccessGameMasterPanel = (role: AccountState) => {
  return (
    role === AccountState.GAME_MASTER ||
    role === AccountState.GAME_MASTER_INVISIBLE ||
    role === AccountState.SUPER_ADMIN
  );
};

export const canAccessSuperAdminPanel = (role: AccountState) => {
  return role === AccountState.SUPER_ADMIN;
};

export const canManageContent = (role: AccountState) => {
  return role === AccountState.GAME_MASTER || role === AccountState.SUPER_ADMIN;
};

export const canAccessCmsDuringBeta = (role: AccountState) => {
  return canAccessGameMasterPanel(role);
};

export const getAdminLandingPath = (role: AccountState) => {
  if (canAccessSuperAdminPanel(role)) {
    return '/superadmin';
  }

  if (canAccessGameMasterPanel(role)) {
    return '/gm';
  }

  return '/';
};
