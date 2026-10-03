import { StrictMode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthBootstrap } from './useAuthBootstrap';
import { refreshSession } from '../../services/apiClient';
import { useAuthStore } from '../../lib/authStore';
import { makeFakeAccessToken } from '../../test/testUtils';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const token = makeFakeAccessToken({ sub: '1', role: 'Khách hàng', exp: 9999999999 });

beforeEach(() => useAuthStore.setState({ accessToken: null, role: null, isBootstrapping: true }));
afterEach(() => vi.unstubAllGlobals());

describe('useAuthBootstrap', () => {
  it('restores the session from the refresh cookie and then finishes bootstrapping', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({ success: true, data: { accessToken: token } })));

    renderHook(() => useAuthBootstrap());

    await waitFor(() => expect(useAuthStore.getState().isBootstrapping).toBe(false));
    expect(useAuthStore.getState().accessToken).toBe(token);
    expect(useAuthStore.getState().role).toBe('Khách hàng');
  });

  it.each([
    ['there is no valid cookie', async () => json({ success: false }, 401)],
    ['the network fails', async () => { throw new TypeError('offline'); }],
  ])('finishes bootstrapping signed out when %s', async (_name, respond) => {
    vi.stubGlobal('fetch', vi.fn(respond));

    renderHook(() => useAuthBootstrap());

    await waitFor(() => expect(useAuthStore.getState().isBootstrapping).toBe(false));
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('asks the server once even under StrictMode (which runs effects twice in development)', async () => {
    const fetchMock = vi.fn(async () => json({ success: true, data: { accessToken: token } }));
    vi.stubGlobal('fetch', fetchMock);

    renderHook(() => useAuthBootstrap(), { wrapper: StrictMode });

    await waitFor(() => expect(useAuthStore.getState().isBootstrapping).toBe(false));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('shares one request with a refresh that is already in flight (a rotating refresh cookie must not be used twice)', async () => {
    let finish!: (response: Response) => void;
    const fetchMock = vi.fn(() => new Promise<Response>((resolve) => { finish = resolve; }));
    vi.stubGlobal('fetch', fetchMock);

    const inFlight = refreshSession();
    renderHook(() => useAuthBootstrap());
    finish(json({ success: true, data: { accessToken: token } }));

    await inFlight;
    await waitFor(() => expect(useAuthStore.getState().isBootstrapping).toBe(false));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
