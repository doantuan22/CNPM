import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface FormChoiceProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type: 'checkbox' | 'radio';
  label: ReactNode;
  hint?: string;
  error?: string;
}

export function FormChoice({ type, label, hint, error, id, className, ...props }: FormChoiceProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  return (
    <label className={cn('ui-choice', error && 'ui-choice--error', className)} htmlFor={inputId}>
      <input id={inputId} type={type} aria-invalid={error ? true : undefined} aria-describedby={error ? messageId : hint ? messageId : undefined} {...props} />
      <span className="ui-choice__body"><span>{label}</span>{error ? <small id={messageId} className="ui-field-message--error">{error}</small> : hint ? <small id={messageId}>{hint}</small> : null}</span>
    </label>
  );
}
