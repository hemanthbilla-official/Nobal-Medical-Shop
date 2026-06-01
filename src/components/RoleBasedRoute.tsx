import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import type { UserRole } from "../types";

interface Props {
  allowedRole: UserRole;
  children: React.ReactNode;
}

export function RoleBasedRoute({ allowedRole, children }: Props) {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="h-6 w-6 rounded-full border-2 border-stone-300 border-t-stone-600 animate-spin" />
      </div>
    );
  }

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    const redirect = role === "owner" ? "/owner" : "/worker";
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}
