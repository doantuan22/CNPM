import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../lib/authStore';
import type { RoleName } from '../../lib/roles';

interface ProtectedRouteProps {
  allowedRoles?: RoleName[];
}

/**
 * Frontend route guard — UX convenience only. The backend re-checks auth
 * and role on every request (section 27); this just avoids showing a page
 * the API would reject anyway.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);

  if (isBootstrapping) {
    return (
      <div className="flex justify-center py-16" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role as RoleName))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
