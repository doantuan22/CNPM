import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from 'react';

import { Icon } from '../common/Icon';

import {
  searchFormSchema,
  type SearchFormValues,
} from '../../features/hotels/schemas';

import { useLocations } from '../../features/locations/hooks';

import {
  fromDateInputValue,
  toDateInputValue,
  formatDateVi,
} from '../../lib/utils';

import { DateRangePicker } from '../common/DateRangePicker';

import { Combobox } from '../common/Combobox';

import { GuestPicker } from '../common/GuestPicker';

export type TravelSearchCriteria =
  SearchFormValues;

export type TravelSearchEditor =
  | 'destination'
  | 'dates'
  | 'guests'
  | null;

interface TravelSearchBarProps {
  currentSearch: TravelSearchCriteria;

  onSearch: (
    values: TravelSearchCriteria
  ) => void;

  variant?:
    | 'expanded'
    | 'compact'
    | 'stay';

  loading?: boolean;
}

const editorLabels: Record<
  Exclude<TravelSearchEditor, null>,
  string
> = {
  destination: 'Điểm đến',

  dates: 'Chọn ngày nhận & trả phòng',

  guests: 'Số khách',
};

/* =========================================================
   COUNT NIGHTS
========================================================= */

function countNights(
  from: string,
  to: string
): number {
  const start =
    fromDateInputValue(from);

  const end =
    fromDateInputValue(to);

  if (
    !start ||
    !end ||
    end <= start
  ) {
    return 0;
  }

  return Math.round(
    (
      end.getTime() -
      start.getTime()
    ) /
      86_400_000
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export function TravelSearchBar({
  currentSearch,
  onSearch,
  variant = 'compact',
  loading = false,
}: TravelSearchBarProps) {
  /* =======================================================
     STATE
  ======================================================= */

  const [
    draftSearch,
    setDraftSearch,
  ] =
    useState<TravelSearchCriteria>(
      currentSearch
    );

  const [
    activeEditor,
    setActiveEditor,
  ] =
    useState<TravelSearchEditor>(
      null
    );

  const [
    dateError,
    setDateError,
  ] = useState('');

  const rootRef =
    useRef<HTMLFormElement>(
      null
    );

  const triggerRefs =
    useRef<
      Record<
        string,
        HTMLButtonElement | null
      >
    >({});

  const id = useId();

  /* =======================================================
     VARIANT
  ======================================================= */

  const isStay =
    variant === 'stay';

  const locations =
    useLocations(
      !isStay
    );

  /*
   * Không cho chọn check-in
   * trước ngày hiện tại.
   */
  const today =
    toDateInputValue(
      new Date()
    );

  /* =======================================================
     LOCATIONS
  ======================================================= */

  const destinationOptions =
    (
      locations.data ??
      []
    ).map(
      (item) => ({
        value:
          item.TenThanhPho,

        label:
          item.TenThanhPho,
      })
    );

  if (
    draftSearch.location &&
    !destinationOptions.some(
      (item) =>
        item.value ===
        draftSearch.location
    )
  ) {
    destinationOptions.unshift({
      value:
        draftSearch.location,

      label:
        draftSearch.location,
    });
  }

  /* =======================================================
     CURRENT SEARCH
  ======================================================= */

  const {
    location:
      currentLocation,

    checkIn:
      currentCheckIn,

    checkOut:
      currentCheckOut,

    guests:
      currentGuests,
  } =
    currentSearch;

  /* =======================================================
     SYNC CURRENT SEARCH
  ======================================================= */

  useEffect(() => {
    setDraftSearch({
      location:
        currentLocation,

      checkIn:
        currentCheckIn,

      checkOut:
        currentCheckOut,

      guests:
        currentGuests,
    });

    setDateError('');

    setActiveEditor(
      null
    );
  }, [
    currentLocation,
    currentCheckIn,
    currentCheckOut,
    currentGuests,
  ]);

  /* =======================================================
     EDITOR EVENTS
  ======================================================= */

  useEffect(() => {
    if (
      !activeEditor
    ) {
      return;
    }

    requestAnimationFrame(
      () => {
        if (
          activeEditor ===
          'destination'
        ) {
          rootRef.current
            ?.querySelector<HTMLInputElement>(
              '.ui-combobox input'
            )
            ?.focus();
        }

        if (
          activeEditor ===
          'dates'
        ) {
          rootRef.current
            ?.querySelector<HTMLButtonElement>(
              '.travel-search__date-fields .rdp-day button:not(:disabled)'
            )
            ?.focus();
        }
      }
    );

    /* Click ra ngoài -> đóng popup */

    const onPointerDown = (
      event: PointerEvent
    ) => {
      if (
        !rootRef.current?.contains(
          event.target as Node
        )
      ) {
        setActiveEditor(
          null
        );
      }
    };

    /* ESC -> đóng popup */

    const onKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key !==
        'Escape'
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const trigger =
        triggerRefs.current[
          activeEditor
        ];

      setActiveEditor(
        null
      );

      trigger?.focus();
    };

    document.addEventListener(
      'pointerdown',
      onPointerDown
    );

    document.addEventListener(
      'keydown',
      onKeyDown,
      true
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        onPointerDown
      );

      document.removeEventListener(
        'keydown',
        onKeyDown,
        true
      );
    };
  }, [
    activeEditor,
  ]);

  /* =======================================================
     OPEN EDITOR
  ======================================================= */

  const openEditor = (
    editor: Exclude<
      TravelSearchEditor,
      null
    >
  ) => {
    setDateError('');

    setActiveEditor(
      (current) =>
        current === editor
          ? null
          : editor
    );
  };

  /* =======================================================
     UPDATE DRAFT
  ======================================================= */

  const updateDraft = (
    patch: Partial<
      TravelSearchCriteria
    >
  ) => {
    setDraftSearch(
      (current) => ({
        ...current,
        ...patch,
      })
    );
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const submit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    /* -------------------------------------------------------
       DATE VALIDATION
    ------------------------------------------------------- */

    if (
      !draftSearch.checkIn ||
      !draftSearch.checkOut
    ) {
      setDateError(
        'Vui lòng chọn đầy đủ ngày nhận phòng và trả phòng.'
      );

      setActiveEditor(
        'dates'
      );

      return;
    }

    if (
      draftSearch.checkIn <
      today
    ) {
      setDateError(
        'Ngày nhận phòng không được trước hôm nay.'
      );

      setActiveEditor(
        'dates'
      );

      return;
    }

    if (
      draftSearch.checkOut <=
      draftSearch.checkIn
    ) {
      setDateError(
        'Ngày trả phòng phải sau ngày nhận phòng.'
      );

      setActiveEditor(
        'dates'
      );

      return;
    }

    /* -------------------------------------------------------
       SCHEMA VALIDATION
    ------------------------------------------------------- */

    const parsed =
      searchFormSchema.safeParse(
        draftSearch
      );

    if (
      !parsed.success
    ) {
      const dateIssue =
        parsed.error.issues.find(
          (issue) =>
            issue.path.includes(
              'checkIn'
            ) ||
            issue.path.includes(
              'checkOut'
            )
        );

      setDateError(
        dateIssue?.message ??
          'Vui lòng kiểm tra thông tin tìm kiếm.'
      );

      setActiveEditor(
        dateIssue
          ? 'dates'
          : 'guests'
      );

      return;
    }

    setDateError('');

    /*
     * Bấm Tìm kiếm / Kiểm tra phòng
     * thì mới đóng popup.
     */
    setActiveEditor(
      null
    );

    onSearch({
      ...parsed.data,

      location:
        parsed.data.location
          ?.trim() ||
        undefined,
    });
  };

  /* =======================================================
     DATE DISPLAY
  ======================================================= */

  const nights =
    countNights(
      draftSearch.checkIn,
      draftSearch.checkOut
    );

  const checkInText =
    draftSearch.checkIn
      ? formatDateVi(
          draftSearch.checkIn
        )
      : 'Chọn ngày';

  const checkOutText =
    draftSearch.checkOut
      ? formatDateVi(
          draftSearch.checkOut
        )
      : 'Chọn ngày';

  const dateAriaLabel =
    `Ngày lưu trú. Nhận phòng ${checkInText}. ` +
    `Trả phòng ${checkOutText}`;

  /* =======================================================
     DATE CHANGE

     Logic:
     - Chọn ngày đầu -> check-in
     - DateRangePicker trả checkOut = ''
     - Chọn ngày sau check-in -> check-out
     - Chọn đủ 2 ngày vẫn GIỮ popup
     - Nếu bấm ngày khác khi đã đủ range:
       DateRangePicker tự bắt đầu range mới
  ======================================================= */

  const changeDates = ({
    from,
    to,
  }: {
    from: string;
    to: string;
  }) => {
    setDateError('');

    updateDraft({
      checkIn:
        from,

      checkOut:
        to,
    });

    /*
     * KHÔNG setActiveEditor(null)
     * KHÔNG setTimeout()
     *
     * Popup luôn giữ mở sau khi
     * user chọn ngày.
     */
  };

  /* =======================================================
     EDITOR
  ======================================================= */

  const editor =
    activeEditor && (
      <div
        className={`
          travel-search__editor
          travel-search__editor--${activeEditor}
        `}
        role="dialog"
        aria-label={`Chỉnh sửa ${
          editorLabels[
            activeEditor
          ]
        }`}
      >
        {/* =================================================
            NORMAL EDITOR HEADER
        ================================================= */}

        {activeEditor !==
          'dates' && (
          <div className="travel-search__editor-heading">
            <strong>
              {
                editorLabels[
                  activeEditor
                ]
              }
            </strong>

            <button
              type="button"

              className="travel-search__close"

              aria-label="Đóng"

              onClick={() => {
                setActiveEditor(
                  null
                );

                triggerRefs.current[
                  activeEditor
                ]?.focus();
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* =================================================
            DESTINATION
        ================================================= */}

        {activeEditor ===
          'destination' && (
          <Combobox
            id={`${id}-destination`}

            label="Điểm đến"

            value={
              draftSearch.location ??
              ''
            }

            options={
              destinationOptions
            }

            placeholder="Thành phố, tỉnh..."

            allowCustomValue

            onValueChange={(
              location
            ) =>
              updateDraft({
                location,
              })
            }

            onInputChange={(
              location
            ) =>
              updateDraft({
                location,
              })
            }

            onSelect={() => {
              setActiveEditor(
                null
              );

              requestAnimationFrame(
                () =>
                  triggerRefs.current
                    .destination
                    ?.focus()
              );
            }}
          />
        )}

        {/* =================================================
            DATES
        ================================================= */}

        {activeEditor ===
          'dates' && (
          <div
            className="
              travel-search__date-fields

              w-[min(760px,calc(100vw-32px))]
              max-w-[760px]

              overflow-hidden

              rounded-[18px]

              bg-white
            "
          >
            {/* =============================================
                DATE HEADER
            ============================================= */}

            <div
              className="
                flex
                items-center
                justify-between

                gap-3

                border-b
                border-slate-200

                px-5
                py-3.5
              "
            >
              <div>
                <p
                  className="
                    text-[15px]
                    font-bold

                    text-slate-900
                  "
                >
                  Chọn ngày lưu trú
                </p>

                <p
                  className="
                    mt-0.5

                    text-[12px]

                    text-slate-500
                  "
                >
                  {!draftSearch.checkIn
                    ? 'Chọn ngày nhận phòng'
                    : !draftSearch.checkOut
                      ? 'Tiếp theo, chọn ngày trả phòng'
                      : 'Bạn có thể chọn ngày khác để thay đổi thời gian lưu trú'}
                </p>
              </div>

              <button
                type="button"

                aria-label="Đóng lịch"

                className="
                  grid

                  h-9
                  w-9
                  shrink-0

                  place-items-center

                  rounded-full

                  text-slate-500

                  transition

                  hover:bg-slate-100
                  hover:text-slate-900
                "

                onClick={() => {
                  setActiveEditor(
                    null
                  );

                  triggerRefs.current
                    .dates
                    ?.focus();
                }}
              >
                <i
                  className="
                    ph
                    ph-x

                    text-lg
                  "
                />
              </button>
            </div>

            {/* =============================================
                CHECK-IN / CHECK-OUT SUMMARY
            ============================================= */}

            <div
              className="
                grid

                grid-cols-[1fr_auto_1fr_auto]

                items-center

                gap-3

                border-b
                border-slate-100

                bg-slate-50/80

                px-5
                py-3
              "
            >
              {/* CHECK IN */}

              <div className="min-w-0">
                <span
                  className="
                    block

                    text-[10px]
                    font-bold
                    uppercase

                    tracking-[0.08em]

                    text-slate-400
                  "
                >
                  Nhận phòng
                </span>

                <strong
                  className={`
                    mt-0.5

                    block
                    truncate

                    text-[14px]
                    font-bold

                    ${
                      draftSearch.checkIn
                        ? 'text-slate-900'
                        : 'text-blue-600'
                    }
                  `}
                >
                  {draftSearch.checkIn
                    ? checkInText
                    : 'Chọn ngày'}
                </strong>
              </div>

              {/* ARROW */}

              <i
                className="
                  ph
                  ph-arrow-right

                  text-base

                  text-slate-300
                "
                aria-hidden="true"
              />

              {/* CHECK OUT */}

              <div className="min-w-0">
                <span
                  className="
                    block

                    text-[10px]
                    font-bold
                    uppercase

                    tracking-[0.08em]

                    text-slate-400
                  "
                >
                  Trả phòng
                </span>

                <strong
                  className={`
                    mt-0.5

                    block
                    truncate

                    text-[14px]
                    font-bold

                    ${
                      draftSearch.checkOut
                        ? 'text-slate-900'
                        : draftSearch.checkIn
                          ? 'text-blue-600'
                          : 'text-slate-400'
                    }
                  `}
                >
                  {draftSearch.checkOut
                    ? checkOutText
                    : 'Chọn ngày'}
                </strong>
              </div>

              {/* NIGHTS */}

              <div
                className="
                  flex
                  justify-end
                "
              >
                <span
                  className={`
                    whitespace-nowrap

                    rounded-full

                    px-3
                    py-1.5

                    text-[11px]
                    font-bold

                    ${
                      nights > 0
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-white text-slate-400 ring-1 ring-slate-200'
                    }
                  `}
                >
                  {nights > 0
                    ? `${nights} đêm`
                    : !draftSearch.checkIn
                      ? 'Chọn nhận phòng'
                      : 'Chọn trả phòng'}
                </span>
              </div>
            </div>

            {/* =============================================
                CALENDAR
            ============================================= */}

            <div
              className="
                px-5
                pb-5
                pt-3

                md:px-6
              "
            >
              <DateRangePicker
                value={{
                  from:
                    draftSearch.checkIn,

                  to:
                    draftSearch.checkOut,
                }}

                min={
                  today
                }

                onChange={
                  changeDates
                }
              />

              {/* ERROR */}

              {dateError && (
                <div
                  role="alert"

                  className="
                    mt-3

                    flex
                    items-center

                    gap-2

                    rounded-lg

                    bg-red-50

                    px-3
                    py-2

                    text-[12px]
                    font-medium

                    text-red-600
                  "
                >
                  <i
                    className="
                      ph-fill
                      ph-warning-circle
                    "
                    aria-hidden="true"
                  />

                  <span>
                    {dateError}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================
            GUEST
        ================================================= */}

        {activeEditor ===
          'guests' && (
          <div className="travel-search__guest-editor">
            <GuestPicker
              variant="panel"

              label="Số khách"

              value={
                Number(
                  draftSearch.guests
                ) || 1
              }

              open

              onOpenChange={(
                open
              ) => {
                if (
                  !open
                ) {
                  setActiveEditor(
                    null
                  );
                }
              }}

              onChange={(
                guests
              ) =>
                updateDraft({
                  guests,
                })
              }
            />

            <p className="travel-search__hint">
              Từ 1 đến 50 khách
            </p>
          </div>
        )}

        {/* =================================================
            DONE
        ================================================= */}

        {activeEditor !==
          'dates' && (
          <button
            type="button"

            className="travel-search__done"

            onClick={() => {
              setActiveEditor(
                null
              );

              triggerRefs.current[
                activeEditor
              ]?.focus();
            }}
          >
            Xong
          </button>
        )}
      </div>
    );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <form
      ref={rootRef}

      className={`
        travel-search
        travel-search--${variant}
      `}

      onSubmit={
        submit
      }

      noValidate

      aria-busy={
        loading
      }
    >
      <div className="travel-search__segments">

        {/* =================================================
            DESTINATION
        ================================================= */}

        {!isStay && (
          <div
            className="
              travel-search__segment-wrap
              travel-search__segment-wrap--destination
            "
          >
            <button
              ref={(node) => {
                triggerRefs.current.destination =
                  node;
              }}

              type="button"

              className={`
                travel-search__segment

                ${
                  activeEditor ===
                  'destination'
                    ? 'is-active'
                    : ''
                }
              `}

              aria-expanded={
                activeEditor ===
                'destination'
              }

              aria-controls={`${id}-destination-editor`}

              onClick={() =>
                openEditor(
                  'destination'
                )
              }
            >
              <span className="travel-search__segment-label">
                Điểm đến
              </span>

              <span className="travel-search__segment-value">
                {draftSearch.location
                  ?.trim() ||
                  'Tất cả địa điểm'}
              </span>
            </button>

            {activeEditor ===
              'destination' && (
              <div
                id={`${id}-destination-editor`}
              >
                {editor}
              </div>
            )}
          </div>
        )}

        {/* =================================================
            DATES
        ================================================= */}

        <div
          className="
            travel-search__segment-wrap
            travel-search__segment-wrap--dates
          "
        >
          <button
            ref={(node) => {
              triggerRefs.current.dates =
                node;
            }}

            type="button"

            className={`
              travel-search__segment
              travel-search__segment--dates

              ${
                activeEditor ===
                  'dates'
                  ? 'is-active'
                  : ''
              }
            `}

            aria-label={
              dateAriaLabel
            }

            aria-expanded={
              activeEditor ===
              'dates'
            }

            aria-controls={`${id}-dates-editor`}

            onClick={() =>
              openEditor(
                'dates'
              )
            }
          >
            {/* 
                Chỉ hiện ngày:
                04/10/2026 → 05/10/2026
            */}

            <span
              className="
                travel-search__date-pair

                flex
                items-center
                justify-center

                gap-2
              "
              aria-hidden="true"
            >
              <span
                className="
                  travel-search__segment-value

                  whitespace-nowrap
                "
              >
                {checkInText}
              </span>

              <span
                className="
                  travel-search__date-divider

                  flex
                  items-center
                  justify-center
                "
              >
                <i
                  className="
                    ph
                    ph-arrow-right
                  "
                />
              </span>

              <span
                className="
                  travel-search__segment-value

                  whitespace-nowrap
                "
              >
                {checkOutText}
              </span>
            </span>
          </button>

          {activeEditor ===
            'dates' && (
            <div
              id={`${id}-dates-editor`}
            >
              {editor}
            </div>
          )}
        </div>

        {/* =================================================
            GUEST
        ================================================= */}

        <div
          className="
            travel-search__segment-wrap
            travel-search__segment-wrap--guests
          "
        >
          <button
            ref={(node) => {
              triggerRefs.current.guests =
                node;
            }}

            type="button"

            className={`
              travel-search__segment

              ${
                activeEditor ===
                  'guests'
                  ? 'is-active'
                  : ''
              }
            `}

            aria-expanded={
              activeEditor ===
                'guests'
            }

            aria-controls={`${id}-guests-editor`}

            onClick={() =>
              openEditor(
                'guests'
              )
            }
          >
            <span className="travel-search__segment-label">
              Số khách
            </span>

            <span className="travel-search__segment-value">
              {draftSearch.guests}{' '}
              khách
            </span>
          </button>

          {activeEditor ===
            'guests' && (
            <div
              id={`${id}-guests-editor`}
            >
              {editor}
            </div>
          )}
        </div>
      </div>

      {/* ===================================================
          SUBMIT
      =================================================== */}

      <button
        type="submit"

        className="travel-search__submit"

        disabled={
          loading
        }
      >
        <Icon
          name="magnifying-glass"
          size={18}
        />

        <span>
          {loading
            ? 'Đang tìm...'
            : isStay
              ? 'Kiểm tra phòng'
              : 'Tìm kiếm'}
        </span>
      </button>

      {/* ===================================================
          BACKDROP
      =================================================== */}

      {activeEditor && (
        <button
          type="button"

          className="travel-search__backdrop"

          aria-label="Đóng trình chỉnh sửa"

          onClick={() =>
            setActiveEditor(
              null
            )
          }
        />
      )}
    </form>
  );
}