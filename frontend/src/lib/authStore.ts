import { create } from 'zustand';
import { decodeAccessToken } from './jwt';

interface AuthState {
  accessToken: string | null;
  role: string | null;
  /** True until the initial silent-refresh attempt (on app load) resolves. */
  isBootstrapping: boolean;
  setAccessToken: (token: string | null) => void;
  clear: () => void;
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
  setAccessToken: (token) =>
    set({ accessToken: token, role: token ? (decodeAccessToken(token)?.role ?? null) : null }),
  clear: () => set({ accessToken: null, role: null }),
  finishBootstrap: () => set({ isBootstrapping: false }),
}));

export const getAccessToken = (): string | null => useAuthStore.getState().accessToken;
