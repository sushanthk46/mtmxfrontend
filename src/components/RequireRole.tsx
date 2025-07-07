import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const RequireRole = ({
  allowedRoles,
  children,
}: {
  allowedRoles: string[];
  children: JSX.Element;
}) => {
  const { user, token } = useAuth();

  if (!token) return <Navigate to="/login" replace />;
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireRole;
