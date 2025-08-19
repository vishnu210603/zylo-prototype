import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return currentUser ? children : <Navigate to="/login" />;
}
