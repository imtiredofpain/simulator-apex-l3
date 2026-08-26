import { Navigate } from 'react-router-dom';
import { PATHS } from '@shared/config/pathRoute';

export default function HomeRedirect() {
  return <Navigate to={PATHS.dashboard} replace />;
}
