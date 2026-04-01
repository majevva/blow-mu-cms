import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';

import { canAccessCmsDuringBeta, getAccountRole } from '@/auth/authorization';
import { AuthContext, AuthStateEnum } from '@/contexts/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { auth, betaModeEnabled } = useContext(AuthContext);

  if (auth.state !== AuthStateEnum.SIGNED_IN) {
    return <Navigate to="/" />;
  }

  if (betaModeEnabled && !canAccessCmsDuringBeta(getAccountRole(auth.token))) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
