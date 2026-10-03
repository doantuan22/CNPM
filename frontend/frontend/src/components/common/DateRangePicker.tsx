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

/** Inline check-in / check-out calendar using local-date-safe YYYY-MM-DD strings. */
export function DateRangePicker({ value, onChange, min }: DateRangePickerProps) {
  const twoMonths = useMediaQuery('(min-width: 768px)');
  const selected: DateRange = { from: fromDateInputValue(value.from), to: fromDateInputValue(value.to) };
  const minDate = fromDateInputValue(min);
  const waitingForCheckOut = Boolean(value.from) && !value.to;

  // Booking UX: first click starts a fresh stay, second click must be after check-in.
  // Clicking an earlier/same day while choosing checkout simply starts a new check-in.
  const pickDay = (day: Date) => {
    const iso = toDateInputValue(day);
    if (waitingForCheckOut && iso > value.from) {
      onChange({ from: value.from, to: iso });
      return;
    }
    onChange({ from: iso, to: '' });
  };

  const instruction = waitingForCheckOut
    ? 'Chọn ngày trả phòng'
    : value.from && value.to
      ? 'Chọn một ngày để bắt đầu kỳ lưu trú mới'
      : 'Chọn ngày nhận phòng';

  return (
    <div className="date-range-picker">
      <div className="date-range-picker__guide" aria-live="polite">
        <i className={`ph ${waitingForCheckOut ? 'ph-sign-out' : 'ph-sign-in'}`} aria-hidden="true" />
        <span>{instruction}</span>
      </div>
      <DayPicker
        mode="range"
        locale={vi}
        weekStartsOn={1}
        numberOfMonths={twoMonths ? 2 : 1}
        defaultMonth={selected.from ?? minDate}
        selected={selected}
        disabled={minDate ? { before: minDate } : undefined}
        showOutsideDays
        fixedWeeks
        onDayClick={pickDay}
      />
    </div>
  );
}
