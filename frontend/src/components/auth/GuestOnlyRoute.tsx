import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../lib/authStore';
import { ROLE_HOME } from '../../lib/roles';

/**
 * Guard for pages that only make sense signed out (login, register, forgot
 * password). A visitor who already has a session is sent to their home.
 *
 * The redirect only applies to a session that existed BEFORE the guest page was
 * shown. A session that appears while the form is on screen comes from that
 * form itself, which then navigates on its own (LoginPage -> returnTo,
 * RegisterPage -> /partner/apply), so redirecting here would fight it.
 */
export function GuestOnlyRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);
  const [formShown, setFormShown] = useState(false);

  if (isBootstrapping) {
    return (
      <div className="flex justify-center py-16" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (!accessToken && !formShown) setFormShown(true);

  if (accessToken && !formShown) {
    return <Navigate to={(role && ROLE_HOME[role]) || '/'} replace />;
  }

  return <Outlet />;
}
