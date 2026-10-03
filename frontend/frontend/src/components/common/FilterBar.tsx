import type { ReactNode } from 'react';
import { Button } from './Button';

export interface FilterBarProps {
  children: ReactNode;
  /** Renders a "Xóa bộ lọc" button when given. */
  onReset?: () => void;
}

/** The frame every list page puts its filter fields in. The fields themselves stay `Input` / `Select`. */
export function FilterBar({ children, onReset }: FilterBarProps) {
  return (
    <div role="search" className="surface-card flex flex-wrap items-end gap-3 p-4">
      {children}
      {onReset && <Button type="button" variant="ghost" size="sm" onClick={onReset}>Xóa bộ lọc</Button>}
    </div>
  );
}
