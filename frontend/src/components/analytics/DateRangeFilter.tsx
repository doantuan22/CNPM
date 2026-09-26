import { Button } from '../common/Button';

interface DateRangeFilterProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
}

export function DateRangeFilter({ from, to, onFromChange, onToChange, onApply, onClear }: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="analytics-from" className="mb-1 block text-xs font-medium text-slate-600">
          Từ ngày
        </label>
        <input
          id="analytics-from"
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="analytics-to" className="mb-1 block text-xs font-medium text-slate-600">
          Đến ngày
        </label>
        <input
          id="analytics-to"
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <Button type="button" size="sm" onClick={onApply}>
        Áp dụng
      </Button>
      {(from || to) && (
        <Button type="button" size="sm" variant="outline" onClick={onClear}>
          Xóa lọc
        </Button>
      )}
    </div>
  );
}
