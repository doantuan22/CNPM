import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Which section of a long page the reader is on (scroll-spy), for highlighting its tab.
 * Returns `[activeId, select]`.
 *
 * A section counts as "being read" while it is inside a band near the top of the viewport, just below the
 * sticky header and tab bar. When several are in the band the first on the page wins; between two sections
 * the last one stays; at the very bottom of the page the last one is current.
 *
 * `select(id)` is for a click on a tab: that section is shown as current at once and stays so while the
 * page scrolls itself there (a short section near the end may never reach the band), until the reader
 * scrolls by hand (wheel, touch or keyboard) and the scroll-spy takes over again.
 *
 * Pass `enabled: false` until the sections are in the document. `ids` must be a stable array (define it
 * outside the component), otherwise the observer is rebuilt on every render.
 */
export function useActiveSection(ids: readonly string[], enabled = true) {
  const [active, setActive] = useState(ids[0]);
  const pinned = useRef(false);

  const select = useCallback((id: string) => {
    pinned.current = true;
    setActive(id);
  }, []);

  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return;
    const follow = (id: string) => {
      if (!pinned.current) setActive(id);
    };
    const inBand = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        }
        const current = ids.find((id) => inBand.has(id));
        if (current) follow(current);
      },
      // top: sticky header + tab bar (~130px); bottom: ignore the lower half of the screen
      { rootMargin: '-140px 0px -55% 0px' }
    );
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    // A last section shorter than the band can never scroll up into it: once the page is scrolled to the
    // bottom (and it does scroll at all), the last section is the one being read.
    const onScroll = () => {
      const root = document.documentElement;
      const scrollable = root.scrollHeight > window.innerHeight + 10;
      if (scrollable && window.innerHeight + window.scrollY >= root.scrollHeight - 2) follow(ids[ids.length - 1]);
    };
    const release = () => {
      pinned.current = false;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    for (const name of ['wheel', 'touchmove', 'keydown']) window.addEventListener(name, release, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      for (const name of ['wheel', 'touchmove', 'keydown']) window.removeEventListener(name, release);
    };
  }, [enabled, ids]);

  return [active, select] as const;
}
