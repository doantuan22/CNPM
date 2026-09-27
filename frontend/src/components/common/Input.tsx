import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Renders a `<label>` wired to the input via id/htmlFor. Omit for a standalone filter/search input that supplies its own `aria-label`. Accepts a node so callers can add an inline link/badge next to the text. */
  label?: React.ReactNode;
  /** Field-level validation error (e.g. `errors.Email?.message`). Wires `aria-invalid`/`aria-describedby` automatically. */
  error?: string;
  /** Non-error helper text shown under the input when there is no error. */
  hint?: string;
}

/**
 * Canonical text input — consolidates the `rounded-lg border ... focus:ring-1` markup
 * that was previously duplicated per-page. h-11 (44px) meets the WCAG 2.5.5 touch-target
 * minimum, which no prior ad-hoc input in this codebase guaranteed.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const field = (
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={cn(
          'block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );

    if (!label && !error && !hint) return field;

    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
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

Input.displayName = 'Input';
