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

// Optimized image URL: resize on server + convert to WebP
export function optimizedImg(url, { w, q } = {}) {
  const resolved = resolveMediaUrl(url);
  if (!resolved || !resolved.includes('/api/images/')) return resolved;
  const params = [];
  if (w) params.push(`w=${w}`);
  if (q) params.push(`q=${q}`);
  return params.length ? `${resolved}?${params.join('&')}` : resolved;
}
