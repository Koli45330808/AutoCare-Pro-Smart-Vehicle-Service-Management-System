
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ role }) {
  const config = {
    ADMIN: {
      tokenKey: "adminToken",
      loginPath: "/admin/login",
    },
    TECHNICIAN: {
      tokenKey: "technicianToken",
      loginPath: "/technician/login",
    },
  };

  const selected = config[role];

  if (!selected) {
    return <Navigate to="/login" replace />;
  }

  const token = sessionStorage.getItem(selected.tokenKey);

  if (!token) {
    return <Navigate to={selected.loginPath} replace />;
  }

  return <Outlet />;
}
