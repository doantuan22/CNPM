import React from 'react';
import { cn } from '../../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Renders a `<label>` wired to the select via id/htmlFor. Omit for a standalone filter select that supplies its own `aria-label`. */
  label?: React.ReactNode;
  /** Field-level validation error. Wires `aria-invalid`/`aria-describedby` automatically. */
  error?: string;
  hint?: string;
}

/** Canonical select — same base style and touch-target height as {@link Input}. */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, children, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;

    const field = (
      <select
        ref={ref}
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={cn(
          'block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-xs transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );

    if (!label && !error && !hint) return field;

    return (
      <div>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className={label ? 'mt-1' : undefined}>{field}</div>
        {error ? (
          <p id={errorId} className="mt-1 text-xs text-red-600">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="mt-1 text-xs text-slate-500">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
