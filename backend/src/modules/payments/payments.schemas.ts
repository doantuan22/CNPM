import { z } from 'zod';

export const bookingIdParamSchema = z.object({ id: z.coerce.number().int().positive() });

export const refundIdParamSchema = z.object({ id: z.coerce.number().int().positive() });

/** VNPAY controls every field's presence/shape — validated by verifyVnpaySignature + explicit lookups in the service, not by a strict Zod contract. */
export const vnpayCallbackQuerySchema = z.record(z.string(), z.unknown());
