import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiClient } from './apiClient';
import { queryClient } from '../lib/queryClient';
import { useAuthStore } from '../lib/authStore';
import { makeFakeAccessToken } from '../test/testUtils';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

beforeEach(() => {
  queryClient.clear();
  queryClient.setQueryData(['bookings'], [{ MaDatPhong: 1 }]);
  queryClient.setQueryData(['auth', 'me'], { MaTaiKhoan: 1 });
  queryClient.setQueryData(['hotels', 'detail', 5], { MaKhachSan: 5 });
  queryClient.setQueryData(['locations'], []);
  useAuthStore.setState({
    accessToken: makeFakeAccessToken({ sub: '1', role: 'Khách hàng', exp: 9999999999 }),
    role: 'Khách hàng',
    sessionExpired: false,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  queryClient.clear();
});

describe('apiClient session expiry', () => {
  it('drops user data, keeps public data and flags the session as expired when a 401 survives the refresh attempt', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({ success: false, message: 'Unauthorized' }, 401)));

    await expect(apiClient('/bookings')).rejects.toBeInstanceOf(ApiError);

    expect(queryClient.getQueryCache().getAll().map((query) => query.queryKey)).toEqual([['hotels', 'detail', 5], ['locations']]);
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().sessionExpired).toBe(true);
  });

  it('keeps the cache when the refresh succeeds and the retried request works', async () => {
    const fresh = makeFakeAccessToken({ sub: '1', role: 'Khách hàng', exp: 9999999999 });
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith('/auth/refresh')) return json({ success: true, data: { accessToken: fresh } });
      const authorized = fetchMock.mock.calls.filter(([u]) => !String(u).endsWith('/auth/refresh')).length > 1;
      return authorized ? json({ success: true, data: [] }) : json({ success: false, message: 'expired' }, 401);
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient('/bookings')).resolves.toMatchObject({ success: true });

    expect(queryClient.getQueryData(['bookings'])).toEqual([{ MaDatPhong: 1 }]);
    expect(useAuthStore.getState().sessionExpired).toBe(false);
  });
});
