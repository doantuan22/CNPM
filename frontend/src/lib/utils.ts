import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrencyVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' đ';
}

/** Formats date-only API values without interpreting YYYY-MM-DD as UTC. */
export function formatDateVi(value: string): string {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])) : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

/** Timestamp formatter (dd/mm/yyyy + time) uses the browser locale/timezone. */
export function formatDateTimeVi(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}

/** "15:00" / "1:02:05" for a number of seconds left (never negative). */
export function formatCountdown(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const two = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${two(m)}:${two(s)}` : `${two(m)}:${two(s)}`;
}

/** "05/10/2026 – 06/10/2026" for a stay; both values are date-only API/URL strings. */
export function formatDateRangeVi(from: string, to: string, separator = ' – '): string {
  return `${formatDateVi(from)}${separator}${formatDateVi(to)}`;
}

/** YYYY-MM-DD for <input type="date"> — always local-date-safe (no timezone shift). */
export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Reads a File as a base64 data URI (owner image upload — sent as JSON, no multipart). */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_IMAGE_FILE_BYTES = 5 * 1024 * 1024;

export function imageFileError(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'Chỉ chấp nhận ảnh JPEG, PNG, WEBP hoặc GIF.';
  if (file.size <= 0 || file.size > MAX_IMAGE_FILE_BYTES) return 'Mỗi ảnh phải lớn hơn 0 và tối đa 5MB.';
  return null;
}
