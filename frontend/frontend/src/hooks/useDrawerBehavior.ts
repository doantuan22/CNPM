import { useEffect, type RefObject } from 'react';

const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/**
 * Keyboard and scroll behaviour of an off-canvas drawer (WAI-ARIA modal dialog pattern):
 * while `open` it locks page scroll, moves focus into the drawer, keeps Tab / Shift+Tab inside it,
 * closes on Escape, and on close gives focus back to whatever opened it.
 * Pass `enabled: false` where the same markup is permanently visible (e.g. a desktop sidebar).
 */
export function useDrawerBehavior({ open, onClose, containerRef, enabled = true }: {
  open: boolean;
  onClose: () => void;
  containerRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
}) {
  useEffect(() => {
    if (!enabled || !open) return;
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusable = () => [...(containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
    const frame = requestAnimationFrame(() => focusable()[0]?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (opener?.isConnected) opener.focus();
    };
  }, [enabled, open, onClose, containerRef]);
}
