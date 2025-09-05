import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, requireAdmin }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}
