import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrencyVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' đ';
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
