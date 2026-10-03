import { useEffect, useState, type ImgHTMLAttributes, type ReactNode } from 'react';

interface RemoteImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  fallback?: ReactNode;
}

/**
 * Renders remote hotel imagery without leaving the browser's broken-image icon on screen.
 * A number of OTA/CDN image hosts reject hotlinks that send a referrer, so remote images
 * default to `no-referrer`. If the URL is stale or unavailable, callers can render a
 * purpose-built fallback instead.
 */
export function RemoteImage({ src, fallback = null, onError, referrerPolicy, ...props }: RemoteImageProps) {
  const normalizedSrc = typeof src === 'string' ? src.trim() : '';
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [normalizedSrc]);

  if (!normalizedSrc || failed) return <>{fallback}</>;

  return (
    <img
      {...props}
      src={normalizedSrc}
      referrerPolicy={referrerPolicy ?? 'no-referrer'}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}
