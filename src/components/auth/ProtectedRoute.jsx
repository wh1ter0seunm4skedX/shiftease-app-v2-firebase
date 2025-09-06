import { Navigate } from 'react-router-dom';
import { SkeletonGrid } from '../common/Skeleton';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, requireAdmin }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-12 bg-gray-200 animate-pulse rounded-md mb-6" />
          <SkeletonGrid count={6} />
        </div>
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
