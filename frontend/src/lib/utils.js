import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const BACKEND = process.env.REACT_APP_BACKEND_URL || '';

export function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('/api/')) return `${BACKEND}${url}`;
  return url;
}
