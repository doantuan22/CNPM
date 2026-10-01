import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  /** Extra classes for the header and body cells, e.g. a width. */
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  getRowKey: (row: T) => string | number;
  /** Read out by screen readers; not shown. */
  caption: string;
  isLoading?: boolean;
  /** An error message; shown instead of the rows. */
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: string;
  /** Rendered under the table inside the same card, typically the pagination. */
  footer?: ReactNode;
  /** Skip the card frame, for a table that already sits inside one. */
  bare?: boolean;
}

const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' } as const;

function TableSkeleton({ columns }: { columns: number }) {
  return (
    <div role="status" aria-busy="true" className="grid gap-4 p-4">
      <span className="sr-only">Đang tải...</span>
      {Array.from({ length: 5 }, (_, row) => (
        <div key={row} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }, (_, col) => <Skeleton key={col} className="h-5" />)}
        </div>
      ))}
    </div>
  );
}

/**
 * The one list table: sticky header, horizontal scroll on narrow screens, and the same
 * loading / error / empty states everywhere. Row details open from a `Link` in a cell
 * (keyboard reachable), not from a click handler on the row.
 */
export function DataTable<T>({ columns, rows, getRowKey, caption, isLoading, error, emptyTitle = 'Chưa có dữ liệu', emptyDescription, emptyIcon, footer, bare }: DataTableProps<T>) {
  let body: ReactNode;
  if (isLoading) body = <TableSkeleton columns={columns.length} />;
  else if (error) body = <div role="alert" className="px-6 py-10 text-center text-sm text-danger-ink">{error}</div>;
  else if (!rows || rows.length === 0) body = <EmptyState title={emptyTitle} description={emptyDescription} icon={emptyIcon} />;
  else {
    body = (
      <div className="max-h-[70vh] overflow-auto">
        <table className="data-table">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 z-10">
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={cn(ALIGN[column.align ?? 'left'], column.className)}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key} className={cn(ALIGN[column.align ?? 'left'], column.className)}>{column.cell(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (bare) return <>{body}{footer}</>;

  return (
    <div className="surface-card flex flex-col overflow-hidden">
      {body}
      {footer}
    </div>
  );
}
