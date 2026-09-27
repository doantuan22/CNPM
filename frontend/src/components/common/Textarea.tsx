import React from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  error?: string;
  hint?: string;
}

/** Canonical multi-line text field — same base style as {@link Input}, without a fixed height. */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const errorId = `${textareaId}-error`;
    const hintId = `${textareaId}-hint`;

    const field = (
      <textarea
        ref={ref}
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={cn(
          'block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );

    if (!label && !error && !hint) return field;

    return (
      <div>
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700">
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

Textarea.displayName = 'Textarea';
