import { createContext, ReactNode, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

import { canAccessCmsDuringBeta, getAccountRole } from '@/auth/authorization';
import { isBetaModeEnabled } from '@/config/beta-mode';

export const enum AuthStateEnum {
  SIGNED_IN,
  SIGNED_OUT,
  UNKNOWN,
}

type AuthState = {
  state: AuthStateEnum;
  token?: string;
};

type Auth = {
  auth: AuthState;
  signIn: (token: string) => boolean;
  signOut: () => void;
  betaAccessDenied: boolean;
  clearBetaAccessDenied: () => void;
};

const getAuth = (): AuthState => {
  const currentTime = Math.floor(Date.now() / 1000);
  const token = localStorage.getItem('token');
  const expiration = (token && jwtDecode(token).exp) || 0;
  const isExpiredToken = expiration < currentTime;

  if (token && !isExpiredToken) {
    if (isBetaModeEnabled() && !canAccessCmsDuringBeta(getAccountRole(token))) {
      localStorage.removeItem('token');
      return { state: AuthStateEnum.SIGNED_OUT };
    }

    return { state: AuthStateEnum.SIGNED_IN, token };
  } else {
    localStorage.removeItem('token');
    return { state: AuthStateEnum.UNKNOWN };
  }
};

const INITIAL_AUTH_STATE: AuthState = getAuth();
const noop = () => undefined;

const INITIAL_CONTEXT_STATE: Auth = {
  auth: getAuth(),
  signIn: () => false,
  signOut: noop,
  betaAccessDenied: false,
  clearBetaAccessDenied: noop,
};

export const AuthContext = createContext<Auth>(INITIAL_CONTEXT_STATE);

type AuthProviderProps = {
  children: ReactNode;
};

// eslint-disable-next-line react/prop-types
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(INITIAL_AUTH_STATE);
  const [betaAccessDenied, setBetaAccessDenied] = useState(false);

  const signIn = (token: string) => {
    if (isBetaModeEnabled() && !canAccessCmsDuringBeta(getAccountRole(token))) {
      localStorage.removeItem('token');
      setAuth({ state: AuthStateEnum.SIGNED_OUT });
      setBetaAccessDenied(true);
      return false;
    }

    localStorage.setItem('token', token);
    setBetaAccessDenied(false);
    setAuth({ state: AuthStateEnum.SIGNED_IN, token });
    return true;
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setBetaAccessDenied(false);
    setAuth({ state: AuthStateEnum.SIGNED_OUT });
  };

  const clearBetaAccessDenied = () => {
    setBetaAccessDenied(false);
  };

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  return (
    <AuthContext.Provider
      value={{ auth, signIn, signOut, betaAccessDenied, clearBetaAccessDenied }}
    >
      {children}
    </AuthContext.Provider>
  );
};
