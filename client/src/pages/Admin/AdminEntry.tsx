import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';

import { AuthContext } from '@/contexts/AuthContext';
import { getAccountRole, getAdminLandingPath } from '@/auth/authorization';

const AdminEntry: React.FC = () => {
  const { auth } = useContext(AuthContext);
  const role = getAccountRole(auth.token);

  return <Navigate to={getAdminLandingPath(role)} replace />;
};

export default AdminEntry;
