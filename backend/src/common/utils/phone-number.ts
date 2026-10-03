import { z } from 'zod';

/**
 * TAI_KHOAN.SoDienThoai: trimmed, an optional leading "+", then digits only —
 * 8 to 15 digits in total (E.164 allows at most 15). Shared by registration, profile update and admin account create/update so
 * they can never drift apart again (BUG-009).
 */
export const phoneNumberSchema = z.string().trim().regex(/^\+?[0-9]{8,15}$/, 'Số điện thoại không hợp lệ');
