import type { ClassValue } from 'clsx';
import dayjs from 'dayjs';

/** Merge class names (clsx helper) */
export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ');
}

/** Format price to VNĐ locale string */
export function formatPrice(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' vnđ';
}

/** Format date */
export function formatDate(date: string | Date | number, formatStr: string = 'DD/MM/YYYY HH:mm') {
  return dayjs(date).format(formatStr);
}

/** Truncate a string */
export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}
