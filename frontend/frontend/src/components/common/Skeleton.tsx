import { cn } from '../../lib/utils';

/** A pulsing placeholder block. Decorative: put `aria-busy` / a status label on the container. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('h-4 animate-pulse rounded-sm bg-surface-tertiary', className)} />;
}
