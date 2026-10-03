import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { clearUserCache } from './queryClient';

const keysOf = (client: QueryClient) => client.getQueryCache().getAll().map((query) => query.queryKey);

describe('clearUserCache', () => {
  it('removes per-user and admin/owner data and keeps only the public catalogue', () => {
    const client = new QueryClient();
    [
      ['hotels', 'search', {}], ['hotels', 'detail', 1], ['hotels', 'rooms', 1, {}], ['locations'], ['amenities'], ['health', { checkDb: true }],
      ['auth', 'me'], ['bookings'], ['bookings', 1], ['payment-status', 1], ['reviews', 'mine', 1], ['support', 'mine'], ['partners', 'me'],
      ['owner', 'hotels'], ['admin', 'roles'], ['admin', 'accounts', {}],
    ].forEach((key) => client.setQueryData(key, { value: 1 }));

    clearUserCache(client);

    expect(keysOf(client)).toEqual([['hotels', 'search', {}], ['hotels', 'detail', 1], ['hotels', 'rooms', 1, {}], ['locations'], ['amenities'], ['health', { checkDb: true }]]);
  });

  it('treats a key it does not know as private (fail-safe) and clears finished mutations', async () => {
    const client = new QueryClient();
    client.setQueryData(['brand-new-feature', 1], { secret: true });
    await client.getMutationCache().build(client, { mutationFn: async () => 'x' }).execute(undefined);
    expect(client.getMutationCache().getAll()).toHaveLength(1);

    clearUserCache(client);

    expect(keysOf(client)).toEqual([]);
    expect(client.getMutationCache().getAll()).toHaveLength(0);
  });
});
