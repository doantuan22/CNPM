import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Query keys (first segment) backed by endpoints that need no sign-in and return
 * the same data for everyone: hotel catalogue, locations, amenities, health.
 * Only these may survive a change of user. It is an allow-list on purpose: a
 * key that is not listed here is treated as private and removed, so forgetting
 * to register a new per-user query can never leak data to the next user.
 */
const PUBLIC_QUERY_ROOTS: readonly string[] = ['hotels', 'locations', 'amenities', 'health'];

/** Drops everything cached for the current user (bookings, profile, owner/admin data, mutation results) but keeps public data. */
export function clearUserCache(client: QueryClient = queryClient): void {
  client.removeQueries({ predicate: (query) => !PUBLIC_QUERY_ROOTS.includes(String(query.queryKey[0])) });
  client.getMutationCache().clear();
}
