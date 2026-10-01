import { DayPicker, type DateRange } from 'react-day-picker';
import { vi } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { fromDateInputValue, toDateInputValue } from '../../lib/utils';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export interface DateRangeValue {
  /** YYYY-MM-DD, or '' while nothing is chosen. */
  from: string;
  to: string;
}

export interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  /** Earliest selectable day (YYYY-MM-DD). Omit to allow past days. */
  min?: string;
}

/** Inline check-in / check-out calendar. Works on `YYYY-MM-DD` strings so callers keep their string state and URL params. */
export function DateRangePicker({ value, onChange, min }: DateRangePickerProps) {
  const twoMonths = useMediaQuery('(min-width: 768px)');
  const selected: DateRange = { from: fromDateInputValue(value.from), to: fromDateInputValue(value.to) };
  const minDate = fromDateInputValue(min);

  // A booking range always starts fresh once it is complete, instead of stretching the old one.
  const pickDay = (day: Date) => {
    const iso = toDateInputValue(day);
    const waitingForCheckOut = Boolean(value.from) && !value.to;
    if (waitingForCheckOut && iso > value.from) onChange({ from: value.from, to: iso });
    else onChange({ from: iso, to: '' });
  };

  return (
    <div className="date-range-picker">
      <DayPicker
        mode="range"
        locale={vi}
        weekStartsOn={1}
        numberOfMonths={twoMonths ? 2 : 1}
        defaultMonth={selected.from ?? minDate}
        selected={selected}
        disabled={minDate ? { before: minDate } : undefined}
        onDayClick={pickDay}
      />
    </div>
  );
}
