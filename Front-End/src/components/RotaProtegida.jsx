import { Navigate, Outlet } from 'react-router-dom';
import { pegarToken } from '../services/api';

function RotaProtegida() {
  if (!pegarToken()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default RotaProtegida;