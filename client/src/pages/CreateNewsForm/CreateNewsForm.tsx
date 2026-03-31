import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';

import { AuthContext } from '@/contexts/AuthContext';
import { canManageContent, getAccountRole } from '@/auth/authorization';

import NewsForm from '@/components/NewsForm/NewsForm';

type CreateNewsFormPage = Record<string, never>;

const CreateNewsForm: React.FC<CreateNewsFormPage> = () => {
  const { auth } = useContext(AuthContext);
  const hasPrivilege = canManageContent(getAccountRole(auth.token));

  if (!hasPrivilege) return <Navigate to="/" />;

  return (
    <>
      <NewsForm isEditing={false} />
    </>
  );
};

export default CreateNewsForm;
