import { cn } from '../../lib/utils';

export interface BarListItem {
  label: string;
  value: number;
  /** Tailwind bg-* class for this row's fill — defaults to the app's primary blue when omitted (a plain magnitude ranking, not a category needing distinct hues). */
  colorClass?: string;
  formattedValue?: string;
}

interface BarListProps {
  items: BarListItem[];
  emptyMessage?: string;
}

export function BarList({ items, emptyMessage = 'Chưa có dữ liệu' }: BarListProps) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-500">{emptyMessage}</p>;
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{item.label}</span>
            <span className="text-slate-900">{item.formattedValue ?? item.value.toLocaleString('vi-VN')}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100">
            <div
              className={cn('h-2 rounded-full', item.colorClass ?? 'bg-blue-600')}
              style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
