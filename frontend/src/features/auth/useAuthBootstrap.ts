import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../lib/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * On first mount, tries once to exchange the httpOnly refresh-token cookie
 * (if any) for an access token, so a page reload doesn't force a fresh
 * login when the user still has a valid session. Runs exactly once.
 */
export function useAuthBootstrap(): void {
  const ran = useRef(false);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const finishBootstrap = useAuthStore((s) => s.finishBootstrap);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    fetch(`${API_BASE_URL.replace(/\/$/, '')}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) return;
        const body = await res.json();
        if (body?.data?.accessToken) setAccessToken(body.data.accessToken);
      })
      .catch(() => undefined)
      .finally(() => finishBootstrap());
  }, [setAccessToken, finishBootstrap]);
}
