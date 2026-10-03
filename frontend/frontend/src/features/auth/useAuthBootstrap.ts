import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../lib/authStore';
import { refreshSession } from '../../services/apiClient';

/**
 * On first mount, tries once to exchange the httpOnly refresh-token cookie
 * (if any) for an access token, so a page reload doesn't force a fresh
 * login when the user still has a valid session. Runs exactly once.
 *
 * It goes through apiClient's refreshSession(), the one place that knows the
 * refresh endpoint and that shares a single in-flight request: a rotating
 * refresh cookie must never be sent twice at the same time.
 */
export function useAuthBootstrap(): void {
  const ran = useRef(false);
  const finishBootstrap = useAuthStore((s) => s.finishBootstrap);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    refreshSession()
      .catch(() => false)
      .finally(() => finishBootstrap());
  }, [finishBootstrap]);
}
