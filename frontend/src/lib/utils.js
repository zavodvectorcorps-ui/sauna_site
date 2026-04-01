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

// Optimized image URL: Cloudinary transformations or server-side resize
export function optimizedImg(url, { w, q } = {}) {
  const resolved = resolveMediaUrl(url);
  if (!resolved) return resolved;

  // Cloudinary URL — use native transformations (much faster than our server)
  if (resolved.includes('res.cloudinary.com')) {
    if (!w && !q) return resolved;
    const transforms = [];
    if (w) transforms.push(`w_${w}`);
    if (q) transforms.push(`q_${q}`);
    transforms.push('f_auto', 'c_limit');
    const tStr = transforms.join(',');
    return resolved.replace('/upload/', `/upload/${tStr}/`);
  }

  // Fallback: our API server-side resize
  if (!resolved.includes('/api/images/')) return resolved;
  const params = [];
  if (w) params.push(`w=${w}`);
  if (q) params.push(`q=${q}`);
  return params.length ? `${resolved}?${params.join('&')}` : resolved;
}

// Adaptive video URL: Cloudinary transformations for fast loading
// mobile=true → 720p, desktop → 1280p, auto quality + auto format (WebM/MP4)
export function optimizedVideo(url, { mobile } = {}) {
  const resolved = resolveMediaUrl(url);
  if (!resolved) return resolved;
  if (!resolved.includes('res.cloudinary.com') || !resolved.includes('/video/upload/')) return resolved;
  const w = mobile ? 720 : 1280;
  const transforms = `w_${w},q_auto,f_auto`;
  return resolved.replace('/video/upload/', `/video/upload/${transforms}/`);
}

// Cloudinary poster: first frame of video as optimized JPG
export function videoPoster(url, { mobile } = {}) {
  const resolved = resolveMediaUrl(url);
  if (!resolved) return '';
  if (!resolved.includes('res.cloudinary.com') || !resolved.includes('/video/upload/')) return '';
  const w = mobile ? 720 : 1280;
  return resolved
    .replace('/video/upload/', `/video/upload/so_0,w_${w},q_auto,f_jpg/`)
    .replace(/\.(mp4|webm|mov)$/i, '.jpg');
}
