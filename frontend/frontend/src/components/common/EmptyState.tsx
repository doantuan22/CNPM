import type { ReactNode } from 'react';
import { Icon } from './Icon';

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Phosphor icon name, e.g. `users`. */
  icon?: string;
  action?: ReactNode;
}

/** The empty-list state; styles live in components.css (`.empty-state`). */
export function EmptyState({ title, description, icon = 'tray', action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <Icon name={icon} weight="duotone" />
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__desc">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
