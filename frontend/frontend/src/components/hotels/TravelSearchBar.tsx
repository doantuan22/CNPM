import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Icon } from '../common/Icon';
import { searchFormSchema, type SearchFormValues } from '../../features/hotels/schemas';
import { useLocations } from '../../features/locations/hooks';
import { fromDateInputValue, toDateInputValue, formatDateVi } from '../../lib/utils';
import { DateRangePicker } from '../common/DateRangePicker';
import { Combobox } from '../common/Combobox';
import { GuestPicker } from '../common/GuestPicker';

export type TravelSearchCriteria = SearchFormValues;
export type TravelSearchEditor = 'destination' | 'dates' | 'guests' | null;

interface TravelSearchBarProps {
  currentSearch: TravelSearchCriteria;
  onSearch: (values: TravelSearchCriteria) => void;
  variant?: 'expanded' | 'compact' | 'stay';
  loading?: boolean;
}

const editorLabels: Record<Exclude<TravelSearchEditor, null>, string> = {
  destination: 'Điểm đến',
  dates: 'Chọn ngày nhận & trả phòng',
  guests: 'Số khách',
};

function countNights(from: string, to: string): number {
  const start = fromDateInputValue(from);
  const end = fromDateInputValue(to);
  if (!start || !end || end <= start) return 0;
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function TravelSearchBar({ currentSearch, onSearch, variant = 'compact', loading = false }: TravelSearchBarProps) {
  const [draftSearch, setDraftSearch] = useState<TravelSearchCriteria>(currentSearch);
  const [activeEditor, setActiveEditor] = useState<TravelSearchEditor>(null);
  const [dateError, setDateError] = useState('');
  const rootRef = useRef<HTMLFormElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const id = useId();
  const isStay = variant === 'stay';
  const locations = useLocations(!isStay);
  const enforceFutureDates = variant !== 'stay';
  const today = toDateInputValue(new Date());
  const destinationOptions = (locations.data ?? []).map((item) => ({ value: item.TenThanhPho, label: item.TenThanhPho }));
  if (draftSearch.location && !destinationOptions.some((item) => item.value === draftSearch.location)) {
    destinationOptions.unshift({ value: draftSearch.location, label: draftSearch.location });
  }

  const { location: currentLocation, checkIn: currentCheckIn, checkOut: currentCheckOut, guests: currentGuests } = currentSearch;

  useEffect(() => {
    setDraftSearch({ location: currentLocation, checkIn: currentCheckIn, checkOut: currentCheckOut, guests: currentGuests });
    setDateError('');
    setActiveEditor(null);
  }, [currentLocation, currentCheckIn, currentCheckOut, currentGuests]);

  useEffect(() => {
    if (!activeEditor) return;
    requestAnimationFrame(() => {
      if (activeEditor === 'destination') rootRef.current?.querySelector<HTMLInputElement>('.ui-combobox input')?.focus();
      if (activeEditor === 'dates') rootRef.current?.querySelector<HTMLButtonElement>('.travel-search__date-fields .rdp-day button:not(:disabled)')?.focus();
    });
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setActiveEditor(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        const trigger = triggerRefs.current[activeEditor];
        setActiveEditor(null);
        trigger?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [activeEditor]);

  const openEditor = (editor: Exclude<TravelSearchEditor, null>) => {
    setDateError('');
    setActiveEditor((current) => current === editor ? null : editor);
  };

  const updateDraft = (patch: Partial<TravelSearchCriteria>) => {
    setDraftSearch((current) => ({ ...current, ...patch }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = searchFormSchema.safeParse(draftSearch);
    const futureDateInvalid = enforceFutureDates && draftSearch.checkIn < today;
    if (!parsed.success || futureDateInvalid) {
      const dateIssue = futureDateInvalid
        ? { path: ['checkIn'], message: 'Ngày nhận phòng không được trước hôm nay.' }
        : parsed.success ? undefined : parsed.error.issues.find((issue) => issue.path.includes('checkIn') || issue.path.includes('checkOut'));
      setDateError(dateIssue?.message ?? 'Vui lòng kiểm tra ngày lưu trú.');
      setActiveEditor(dateIssue ? 'dates' : 'guests');
      return;
    }
    setActiveEditor(null);
    setDateError('');
    onSearch({ ...parsed.data, location: parsed.data.location?.trim() || undefined });
  };

  const nights = countNights(draftSearch.checkIn, draftSearch.checkOut);
  const checkInText = draftSearch.checkIn ? formatDateVi(draftSearch.checkIn) : 'Chọn ngày';
  const checkOutText = draftSearch.checkOut ? formatDateVi(draftSearch.checkOut) : 'Chọn ngày';
  const dateAriaLabel = `Ngày lưu trú. Nhận phòng ${checkInText}. Trả phòng ${checkOutText}`;

  const editor = activeEditor && <div className={`travel-search__editor travel-search__editor--${activeEditor}`} role="dialog" aria-label={`Chỉnh sửa ${editorLabels[activeEditor]}`}>
    <div className="travel-search__editor-heading">
      <strong>{editorLabels[activeEditor]}</strong>
      <button type="button" className="travel-search__close" aria-label="Đóng" onClick={() => { setActiveEditor(null); triggerRefs.current[activeEditor]?.focus(); }}>×</button>
    </div>
    {activeEditor === 'destination' && <Combobox
      id={`${id}-destination`}
      label="Điểm đến"
      value={draftSearch.location ?? ''}
      options={destinationOptions}
      placeholder="Thành phố, tỉnh..."
      allowCustomValue
      onValueChange={(location) => updateDraft({ location })}
      onInputChange={(location) => updateDraft({ location })}
      onSelect={() => {
        setActiveEditor(null);
        requestAnimationFrame(() => triggerRefs.current.destination?.focus());
      }}
    />}
    {activeEditor === 'dates' && <div className="travel-search__date-fields">
      <div className="travel-search__date-overview">
        <div className={`travel-search__date-overview-item ${draftSearch.checkIn ? 'is-filled' : ''}`}>
          <span>Nhận phòng</span>
          <strong>{checkInText}</strong>
        </div>
        <span className="travel-search__date-arrow" aria-hidden="true"><i className="ph ph-arrow-right" /></span>
        <div className={`travel-search__date-overview-item ${draftSearch.checkOut ? 'is-filled' : ''}`}>
          <span>Trả phòng</span>
          <strong>{checkOutText}</strong>
        </div>
        <span className="travel-search__night-badge">{nights > 0 ? `${nights} đêm` : 'Chọn đủ 2 ngày'}</span>
      </div>
      <DateRangePicker
        value={{ from: draftSearch.checkIn, to: draftSearch.checkOut }}
        min={enforceFutureDates ? today : undefined}
        onChange={({ from, to }) => { updateDraft({ checkIn: from, checkOut: to }); setDateError(''); }}
      />
      <p className="travel-search__hint" aria-live="polite">
        {draftSearch.checkIn && !draftSearch.checkOut
          ? 'Đã chọn ngày nhận phòng. Hãy chọn ngày trả phòng sau ngày nhận phòng.'
          : nights > 0
            ? `Kỳ lưu trú ${nights} đêm · ${checkInText} → ${checkOutText}`
            : 'Chọn ngày nhận phòng trước, sau đó chọn ngày trả phòng.'}
      </p>
      {dateError && <p className="travel-search__error" role="alert">{dateError}</p>}
    </div>}
    {activeEditor === 'guests' && <div className="travel-search__guest-editor">
      <GuestPicker variant="panel" label="Số khách" value={Number(draftSearch.guests) || 1} open onOpenChange={(open) => { if (!open) setActiveEditor(null); }} onChange={(guests) => updateDraft({ guests })} />
      <p className="travel-search__hint">Từ 1 đến 50 khách</p>
    </div>}
    <button type="button" className="travel-search__done" onClick={() => { setActiveEditor(null); triggerRefs.current[activeEditor]?.focus(); }}>Xong</button>
  </div>;

  return <form ref={rootRef} className={`travel-search travel-search--${variant}`} onSubmit={submit} noValidate aria-busy={loading}>
    <div className="travel-search__segments">
      {!isStay && <div className="travel-search__segment-wrap travel-search__segment-wrap--destination">
        <button ref={(node) => { triggerRefs.current.destination = node; }} type="button" className={`travel-search__segment ${activeEditor === 'destination' ? 'is-active' : ''}`} aria-expanded={activeEditor === 'destination'} aria-controls={`${id}-destination-editor`} onClick={() => openEditor('destination')}>
          <span className="travel-search__segment-label">Điểm đến</span><span className="travel-search__segment-value">{draftSearch.location?.trim() || 'Tất cả địa điểm'}</span>
        </button>
        {activeEditor === 'destination' && <div id={`${id}-destination-editor`}>{editor}</div>}
      </div>}
      <div className="travel-search__segment-wrap travel-search__segment-wrap--dates">
        <button
          ref={(node) => { triggerRefs.current.dates = node; }}
          type="button"
          className={`travel-search__segment travel-search__segment--dates ${activeEditor === 'dates' ? 'is-active' : ''}`}
          aria-label={dateAriaLabel}
          aria-expanded={activeEditor === 'dates'}
          aria-controls={`${id}-dates-editor`}
          onClick={() => openEditor('dates')}
        >
          <span className="travel-search__date-pair" aria-hidden="true">
            <span className="travel-search__date-slot">
              <span className="travel-search__segment-label">Nhận phòng</span>
              <span className="travel-search__segment-value">{checkInText}</span>
            </span>
            <span className="travel-search__date-divider"><i className="ph ph-arrow-right" /></span>
            <span className="travel-search__date-slot">
              <span className="travel-search__segment-label">Trả phòng</span>
              <span className="travel-search__segment-value">{checkOutText}</span>
            </span>
          </span>
        </button>
        {activeEditor === 'dates' && <div id={`${id}-dates-editor`}>{editor}</div>}
      </div>
      <div className="travel-search__segment-wrap travel-search__segment-wrap--guests">
        <button ref={(node) => { triggerRefs.current.guests = node; }} type="button" className={`travel-search__segment ${activeEditor === 'guests' ? 'is-active' : ''}`} aria-expanded={activeEditor === 'guests'} aria-controls={`${id}-guests-editor`} onClick={() => openEditor('guests')}>
          <span className="travel-search__segment-label">Số khách</span><span className="travel-search__segment-value">{draftSearch.guests} khách</span>
        </button>
        {activeEditor === 'guests' && <div id={`${id}-guests-editor`}>{editor}</div>}
      </div>
    </div>
    <button type="submit" className="travel-search__submit" disabled={loading}>
      <Icon name="magnifying-glass" size={18} />
      <span>{loading ? 'Đang tìm...' : isStay ? 'Kiểm tra phòng' : 'Tìm kiếm'}</span>
    </button>
    {activeEditor && <button type="button" className="travel-search__backdrop" aria-label="Đóng trình chỉnh sửa" onClick={() => setActiveEditor(null)} />}
  </form>;
}
