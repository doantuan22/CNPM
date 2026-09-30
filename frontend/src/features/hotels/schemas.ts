import { z } from 'zod';
import { toDateInputValue } from '../../lib/utils';

export const searchFormSchema = z
  .object({
    location: z.string().trim().optional(),
    checkIn: z.string().min(1, 'Vui lòng chọn ngày nhận phòng'),
    checkOut: z.string().min(1, 'Vui lòng chọn ngày trả phòng'),
    guests: z.coerce.number().int().min(1, 'Ít nhất 1 khách').max(50, 'Tối đa 50 khách'),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: 'Ngày trả phòng phải sau ngày nhận phòng',
    path: ['checkOut'],
  });
export type SearchFormValues = z.infer<typeof searchFormSchema>;

/** Guests assumed when a search does not say: what the home search box shows, and what every page falls back to. */
export const DEFAULT_GUESTS = 2;

/** Guest count from a URL parameter; the default when it is missing or not a whole number of at least 1. */
export const parseGuests = (raw: string | null): number => {
  const guests = Number(raw);
  return raw !== null && Number.isInteger(guests) && guests >= 1 ? guests : DEFAULT_GUESTS;
};

/** Defaults a fresh search form to tomorrow → the day after (a valid 1-night stay). */
export const defaultSearchDates = (): { checkIn: string; checkOut: string } => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  return { checkIn: toDateInputValue(tomorrow), checkOut: toDateInputValue(dayAfter) };
};
