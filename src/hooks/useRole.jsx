import { useAuth } from '../contexts/AuthContext';

export function useRole() {
  const { user } = useAuth();

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isUser = () => {
    return user?.role === 'user';
  };

  return {
    isAdmin,
    isUser,
    role: user?.role
  };
}
