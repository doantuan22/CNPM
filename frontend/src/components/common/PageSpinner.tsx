import { cn } from '../../lib/utils';

/** Centered loading spinner for a page or a section; the label is only read out (screen readers), not shown. */
export function PageSpinner({ label = 'Đang tải...', className = 'py-16' }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex justify-center', className)} role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true"></div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
