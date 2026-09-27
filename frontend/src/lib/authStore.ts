import { create } from 'zustand';
import { decodeAccessToken } from './jwt';

interface AuthState {
  accessToken: string | null;
  role: string | null;
  /** True until the initial silent-refresh attempt (on app load) resolves. */
  isBootstrapping: boolean;
  /** True only when the session ended because a refresh attempt failed (not a manual logout) — lets LoginPage explain the redirect instead of bouncing the user silently. */
  sessionExpired: boolean;
  setAccessToken: (token: string | null) => void;
  clear: () => void;
  /** Called by apiClient when a 401 survives a refresh attempt — distinct from clear() so the UI can tell "expired" apart from "logged out". */
  expireSession: () => void;
  acknowledgeSessionExpired: () => void;
  finishBootstrap: () => void;
}

/**
 * Client-side auth state. Intentionally minimal per TECH-0 (Zustand only for
 * client/UI state): holds the in-memory access token and the role decoded
 * from it for UX routing. The full profile is server state and belongs to
 * TanStack Query (see features/auth/hooks.ts useMe), not duplicated here.
 * The access token is memory-only (never localStorage) — the refresh token
 * lives in an httpOnly cookie the frontend cannot and does not touch.
 */
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  role: null,
  isBootstrapping: true,
  sessionExpired: false,
  setAccessToken: (token) =>
    set({ accessToken: token, role: token ? (decodeAccessToken(token)?.role ?? null) : null, sessionExpired: false }),
  clear: () => set({ accessToken: null, role: null, sessionExpired: false }),
  expireSession: () => set({ accessToken: null, role: null, sessionExpired: true }),
  acknowledgeSessionExpired: () => set({ sessionExpired: false }),
  finishBootstrap: () => set({ isBootstrapping: false }),
}));

export const getAccessToken = (): string | null => useAuthStore.getState().accessToken;
