import { Alert } from './Alert';

export function FormErrorSummary({ errors, fieldLabels, fieldIds, title = 'Kiểm tra lại thông tin' }: {
  errors: Record<string, { message?: unknown } | undefined>;
  fieldLabels: Record<string, string>;
  fieldIds: Record<string, string>;
  title?: string;
}) {
  const items = Object.entries(errors).filter((entry): entry is [string, { message?: unknown }] => Boolean(entry[1]?.message));
  if (!items.length) return null;
  return (
    <Alert tone="error" title={title}>
      <ul className="form-error-summary__list">
        {items.map(([name, error]) => (
          <li key={name}>
            <button type="button" onClick={() => document.getElementById(fieldIds[name] ?? name)?.focus()}>
              {fieldLabels[name] ?? name}: {String(error.message)}
            </button>
          </li>
        ))}
      </ul>
    </Alert>
  );
}
