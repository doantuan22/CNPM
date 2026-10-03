import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function Alert({ tone = 'info', title, children, className, live = true, id }: {
  tone?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  className?: string;
  live?: boolean;
  id?: string;
}) {
  return (
    <div id={id} className={cn('ui-alert', `ui-alert--${tone}`, className)} role={tone === 'error' ? 'alert' : live ? 'status' : undefined} aria-live={live && tone !== 'error' ? 'polite' : undefined}>
      <span className="ui-alert__icon" aria-hidden="true"><i className={`ph ${tone === 'success' ? 'ph-check-circle' : tone === 'warning' ? 'ph-warning-circle' : tone === 'error' ? 'ph-warning-octagon' : 'ph-info'}`} /></span>
      <div className="ui-alert__body">
        {title && <strong>{title}</strong>}
        <div>{children}</div>
      </div>
    </div>
  );
}
