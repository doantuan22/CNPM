import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Inner padding. Turn it off when the card wraps a table or an image. */
  padded?: boolean;
  /** The one floating surface of a page (e.g. the booking panel). */
  raised?: boolean;
}

/** A bordered content surface; styles live in booking-flow.css (`.surface-card`). */
export function Card({ padded = true, raised = false, className, ...props }: CardProps) {
  return <div className={cn('surface-card', raised && 'surface-card--raised', padded && 'p-5', className)} {...props} />;
}
