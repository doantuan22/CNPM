import { useEffect, useRef, useState } from 'react';

/**
 * Seconds left of a hold, counting down once a second.
 *
 * `secondsLeft` is what the SERVER reported when the data was fetched and `startedAt` is the moment
 * (ms, e.g. React Query's `dataUpdatedAt`) it arrived on this device. Time already spent since then is
 * subtracted, so the result does not depend on the device clock being set correctly. Null while there is
 * no hold. `onEnd` is called once when it reaches 0 and again only for a newer report that also ends.
 */
export function useCountdown(secondsLeft: number | null, startedAt: number, onEnd: () => void): number | null {
  const [now, setNow] = useState(() => Date.now());
  const endedFor = useRef<string | null>(null);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => {
    if (secondsLeft === null) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, startedAt]);

  const remaining = secondsLeft === null ? null : Math.max(0, secondsLeft - Math.floor((now - startedAt) / 1000));

  useEffect(() => {
    if (remaining !== 0) return;
    const report = `${secondsLeft}:${startedAt}`;
    if (endedFor.current === report) return;
    endedFor.current = report;
    onEndRef.current();
  }, [remaining, secondsLeft, startedAt]);

  return remaining;
}
