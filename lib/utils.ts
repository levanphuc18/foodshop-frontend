import { type ClassValue, clsx } from 'clsx';

/** Merge class names (clsx helper) */
export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ');
}

/** Format price to VNĐ locale string */
export function formatPrice(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' vnđ';
}

/** Truncate a string */
export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}
