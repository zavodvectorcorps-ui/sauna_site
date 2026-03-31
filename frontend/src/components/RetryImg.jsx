import { useState, useCallback, useRef } from 'react';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1500;

export const RetryImg = ({ src, alt, className, loading, ...props }) => {
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef(null);

  const handleError = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      timerRef.current = setTimeout(() => {
        const sep = src.includes('?') ? '&' : '?';
        setCurrentSrc(`${src}${sep}_r=${retryCount + 1}`);
        setRetryCount(prev => prev + 1);
      }, RETRY_DELAY * (retryCount + 1));
    }
  }, [src, retryCount]);

  return (
    <img
      src={currentSrc}
      alt={alt || ''}
      className={`${className || ''} ${loaded ? '' : 'bg-white/5'}`}
      loading={loading || 'lazy'}
      onLoad={() => setLoaded(true)}
      onError={handleError}
      {...props}
    />
  );
};
