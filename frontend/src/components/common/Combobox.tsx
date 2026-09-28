import { useId, useMemo, useState, type FocusEvent, type KeyboardEvent } from 'react';

export interface ComboboxOption { value: string; label: string }

export function Combobox({ id, label, value, options, onValueChange, placeholder = 'Tìm và chọn...', error, hint, disabled }: {
  id?: string;
  label: string;
  value: string;
  options: ComboboxOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-options`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi');
    return normalized ? options.filter((option) => option.label.toLocaleLowerCase('vi').includes(normalized)) : options;
  }, [options, query]);

  const choose = (option: ComboboxOption) => {
    onValueChange(option.value);
    setQuery('');
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(filtered.length - 1, index + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => index <= 0 ? filtered.length - 1 : index - 1);
    } else if (event.key === 'Enter' && open && filtered[activeIndex]) {
      event.preventDefault();
      choose(filtered[activeIndex]);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
      setQuery('');
    }
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="ui-field-group ui-combobox" onBlur={onBlur}>
      <label htmlFor={inputId} className="ui-field-label">{label}</label>
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && filtered[activeIndex] ? `${listId}-${activeIndex}` : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        autoComplete="off"
        className="ui-field"
        value={open ? query : selected?.label ?? ''}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => { setQuery(''); setActiveIndex(-1); setOpen(true); }}
        onChange={(event) => { setQuery(event.target.value); setActiveIndex(-1); setOpen(true); onValueChange(''); }}
        onKeyDown={onKeyDown}
      />
      {open && (
        <ul id={listId} className="ui-combobox__list" role="listbox" aria-label={`${label} tùy chọn`}>
          {filtered.length ? filtered.map((option, index) => (
            <li key={option.value} id={`${listId}-${index}`} role="option" aria-selected={option.value === value} className={index === activeIndex ? 'ui-combobox__option is-active' : 'ui-combobox__option'} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(option)}>
              {option.label}{option.value === value && <i className="ph ph-check" aria-hidden="true" />}
            </li>
          )) : <li className="ui-combobox__empty" role="option" aria-disabled="true">Không có kết quả phù hợp</li>}
        </ul>
      )}
      {error ? <p id={errorId} className="ui-field-message ui-field-message--error">{error}</p> : hint ? <p id={hintId} className="ui-field-message ui-field-message--hint">{hint}</p> : null}
    </div>
  );
}
