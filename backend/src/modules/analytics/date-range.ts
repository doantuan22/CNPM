import { z } from 'zod';

/** A user-facing `to` is inclusive (e.g. "31/01" means through end of that day) — analytics.repository.ts always wants an exclusive upper bound, so add one day here, once, at the API boundary. */
export const toExclusiveEnd = (to: Date): Date => new Date(to.getTime() + 24 * 60 * 60 * 1000);

export const dateRangeQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export type DateRangeQuery = z.infer<typeof dateRangeQuerySchema>;
