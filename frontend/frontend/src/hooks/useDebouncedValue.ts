import { useEffect, useState } from 'react';

/** Returns `value` only after it stopped changing for `delayMs` — keeps search-as-you-type to one request per pause. */
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
