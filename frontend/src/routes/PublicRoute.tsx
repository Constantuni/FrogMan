import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);

  return token ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

export default PublicRoute;