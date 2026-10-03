import { useEffect, useState } from 'react';
import {
  useParams,
  useSearchParams,
  useNavigate,
} from 'react-router-dom';

import {
  useHotelDetail,
  useHotelRooms,
} from '../../features/hotels/hooks';

import {
  defaultSearchDates,
  parseGuests,
} from '../../features/hotels/schemas';

import { useQuote } from '../../features/quotes/hooks';
import { quoteMatchesRequest } from '../../features/quotes/match';

import { useCreateBooking } from '../../features/bookings/hooks';

import { useAuthStore } from '../../lib/authStore';
import { ROLE_NAMES } from '../../lib/roles';
import { ApiError } from '../../services/apiClient';

import {
  formatCurrencyVND,
  cn,
} from '../../lib/utils';

import { HotelHeader } from '../../components/hotels/detail/HotelHeader';

import { HotelGallery } from '../../components/hotels/detail/HotelGallery';

import { HotelSectionNav } from '../../components/hotels/detail/HotelSectionNav';

import { RoomList } from '../../components/hotels/detail/RoomList';

import {
  HotelOverview,
  HotelAmenities,
} from '../../components/hotels/detail/HotelAbout';

import { BookingPanel } from '../../components/hotels/detail/BookingPanel';

import { MobileBookingBar } from '../../components/hotels/detail/MobileBookingBar';

import { HotelGalleryDialog } from '../../components/hotels/HotelGalleryDialog';

import { useToast } from '../../components/common/FeedbackProvider';

import { shareUrl } from '../../lib/share';

import { useActiveSection } from '../../hooks/useActiveSection';

import { PageSpinner } from '../../components/common/PageSpinner';

/* =========================================================
   SECTION ORDER

   Thứ tự hiển thị trên trang:
   1. Tổng quan
   2. Tiện nghi
   3. Loại phòng & Giá
========================================================= */

const PAGE_SECTIONS = [
  {
    id: 'tong-quan',
    label: 'Tổng quan',
  },
  {
    id: 'tien-nghi',
    label: 'Tiện nghi',
  },
  {
    id: 'loai-phong',
    label: 'Loại phòng & Giá',
  },
] as const;

const SECTION_IDS =
  PAGE_SECTIONS.map(
    (section) => section.id
  );

/* =========================================================
   HOTEL DETAIL PAGE
========================================================= */

export default function HotelDetailPage() {
  const { id } =
    useParams<{ id: string }>();

  const hotelId = Number(id);

  const navigate =
    useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  /* =======================================================
     LOCAL STATE
  ======================================================= */

  const [
    selectedRooms,
    setSelectedRooms,
  ] = useState<
    Record<number, number>
  >({});

  const [
    promoCode,
    setPromoCode,
  ] = useState('');

  /*
   * Promo code thực tế đang được dùng để báo giá.
   * Chỉ thay đổi khi người dùng bấm "Áp dụng"
   * hoặc thay đổi phòng.
   */
  const [
    appliedPromo,
    setAppliedPromo,
  ] = useState('');

  const [
    ghiChu,
    setGhiChu,
  ] = useState('');

  const [
    galleryIndex,
    setGalleryIndex,
  ] = useState<
    number | null
  >(null);

  const notify =
    useToast();

  /* =======================================================
     AUTH
  ======================================================= */

  const accessToken =
    useAuthStore(
      (s) => s.accessToken
    );

  const role =
    useAuthStore(
      (s) => s.role
    );

  /* =======================================================
     BOOKING MUTATION
  ======================================================= */

  const bookingMutation =
    useCreateBooking(
      hotelId
    );

  /* =======================================================
     SEARCH PARAMETERS
  ======================================================= */

  const defaults =
    defaultSearchDates();

  const checkIn =
    searchParams.get(
      'checkIn'
    ) ||
    defaults.checkIn;

  const checkOut =
    searchParams.get(
      'checkOut'
    ) ||
    defaults.checkOut;

  const guests =
    parseGuests(
      searchParams.get(
        'guests'
      )
    );

  /* =======================================================
     SELECTED ROOMS
  ======================================================= */

  const selectedRoomLines =
    Object.entries(
      selectedRooms
    )
      .map(
        ([
          maLoaiPhong,
          soLuong,
        ]) => ({
          maLoaiPhong:
            Number(
              maLoaiPhong
            ),

          soLuong,
        })
      )
      .filter(
        (line) =>
          line.soLuong > 0
      );

  const selectedRoomCount =
    selectedRoomLines.reduce(
      (
        sum,
        line
      ) =>
        sum +
        line.soLuong,

      0
    );

  /* =======================================================
     HOTEL DATA
  ======================================================= */

  const hotelQuery =
    useHotelDetail(
      hotelId
    );

  const hotelLoaded =
    Boolean(
      hotelQuery.data
    );

  /* =======================================================
     SECTION NAV
  ======================================================= */

  const [
    activeSection,
    selectSection,
  ] =
    useActiveSection(
      SECTION_IDS,
      hotelLoaded
    );

  /* =======================================================
     ROOM AVAILABILITY
  ======================================================= */

  const roomsQuery =
    useHotelRooms(
      hotelId,
      {
        checkIn,
        checkOut,
        guests,
      }
    );

  /* =======================================================
     QUOTE
  ======================================================= */

  const quoteQuery =
    useQuote(
      hotelId,

      selectedRoomLines.length >
        0
        ? {
            checkIn,

            checkOut,

            rooms:
              selectedRoomLines,

            promoCode:
              appliedPromo ||
              undefined,
          }
        : null
    );

  /* =======================================================
     BOOKING PANEL VISIBILITY
  ======================================================= */

  const [
    bookingPanelVisible,
    setBookingPanelVisible,
  ] = useState(false);

  useEffect(() => {
    const panel =
      document.getElementById(
        'dat-phong'
      );

    if (
      !panel ||
      typeof IntersectionObserver ===
        'undefined'
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) =>
          setBookingPanelVisible(
            entry.isIntersecting
          )
      );

    observer.observe(
      panel
    );

    return () =>
      observer.disconnect();
  }, [hotelLoaded]);

  /* =======================================================
     CHANGE SEARCH DATES
  ======================================================= */

  const onDatesSubmit = (
    values: {
      checkIn: string;
      checkOut: string;
      guests: number;
    }
  ) => {
    /*
     * Khi đổi ngày:
     * - bỏ phòng đang chọn
     * - reset booking error
     * - cập nhật query URL
     */

    setSelectedRooms(
      {}
    );

    bookingMutation.reset();

    setSearchParams({
      checkIn:
        values.checkIn,

      checkOut:
        values.checkOut,

      guests:
        String(
          values.guests
        ),
    });
  };

  /* =======================================================
     ROOM QUANTITY
  ======================================================= */

  const setRoomQuantity = (
    maLoaiPhong: number,
    quantity: number,
    available: number
  ) => {
    bookingMutation.reset();

    /*
     * Nếu user thay đổi phòng
     * thì quote lại với promo hiện đang nhập.
     */
    setAppliedPromo(
      promoCode.trim()
    );

    const safeQuantity =
      Math.min(
        available,

        Math.max(
          0,

          Math.floor(
            Number.isFinite(
              quantity
            )
              ? quantity
              : 0
          )
        )
      );

    setSelectedRooms(
      (current) => {
        const next = {
          ...current,
        };

        if (
          safeQuantity ===
          0
        ) {
          delete next[
            maLoaiPhong
          ];
        } else {
          next[
            maLoaiPhong
          ] =
            safeQuantity;
        }

        return next;
      }
    );
  };

  /* =======================================================
     PROMO
  ======================================================= */

  const changePromoCode = (
    value: string
  ) => {
    setPromoCode(
      value
    );

    if (
      !value.trim()
    ) {
      setAppliedPromo(
        ''
      );
    }
  };

  const applyPromo = () => {
    bookingMutation.reset();

    setAppliedPromo(
      promoCode.trim()
    );
  };

  /* =======================================================
     QUOTE VALIDATION
  ======================================================= */

  const quoteMatchesSelection =
    quoteMatchesRequest(
      quoteQuery.data,

      {
        checkIn,

        checkOut,

        rooms:
          selectedRoomLines,
      }
    );

  const quoteMatchesPromo =
    appliedPromo ===
    promoCode.trim();

  /* =======================================================
     CONFIRM BOOKING
  ======================================================= */

  const confirmBooking = () => {
    if (
      selectedRoomLines.length ===
        0 ||
      !quoteMatchesSelection ||
      !quoteQuery.data
        ?.KhaDung
    ) {
      return;
    }

    bookingMutation.mutate(
      {
        checkIn,

        checkOut,

        rooms:
          selectedRoomLines,

        promoCode:
          quoteQuery.data
            .PromoHopLe
            ? appliedPromo
            : undefined,

        ghiChu:
          ghiChu.trim() ||
          undefined,
      },

      {
        onSuccess: (
          booking
        ) => {
          navigate(
            `/bookings/${booking.MaDatPhong}`,

            {
              state: {
                justBooked:
                  true,
              },
            }
          );
        },
      }
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    hotelQuery.isLoading
  ) {
    return (
      <PageSpinner />
    );
  }

  /* =======================================================
     HOTEL ERROR
  ======================================================= */

  if (
    hotelQuery.isError ||
    !hotelQuery.data
  ) {
    return (
      <div
        role="alert"
        className="
          mx-auto
          mt-8

          max-w-md

          rounded-lg

          bg-danger-light

          px-4
          py-3

          text-center
          text-sm

          text-danger-ink
        "
      >
        {hotelQuery.error instanceof
        ApiError
          ? hotelQuery.error
              .message
          : 'Không tìm thấy khách sạn'}
      </div>
    );
  }

  /* =======================================================
     HOTEL
  ======================================================= */

  const hotel =
    hotelQuery.data;

  /* =======================================================
     MOBILE BOOKING PANEL
  ======================================================= */

  const goToBookingPanel =
    () =>
      document
        .getElementById(
          'dat-phong'
        )
        ?.scrollIntoView({
          block: 'start',
        });

  /* =======================================================
     MOBILE SUMMARY TOTAL
  ======================================================= */

  const summaryTotal =
    quoteQuery.isError
      ? 'Không thể báo giá'

      : quoteMatchesSelection &&
          quoteQuery.data

        ? quoteQuery.data
            .KhaDung

          ? formatCurrencyVND(
              quoteQuery.data
                .TongTienThanhToan
            )

          : 'Cần điều chỉnh lựa chọn'

        : 'Đang cập nhật báo giá…';

  /* =======================================================
     SHARE
  ======================================================= */

  const shareHotel =
    async () => {
      try {
        const result =
          await shareUrl({
            title:
              hotel.TenKhachSan,

            url:
              window.location
                .href,
          });

        if (
          result ===
          'copied'
        ) {
          notify({
            title:
              'Đã sao chép liên kết',

            tone:
              'success',
          });
        }
      } catch {
        notify({
          title:
            'Không thể chia sẻ',

          description:
            'Hãy sao chép liên kết từ thanh địa chỉ của trình duyệt.',

          tone:
            'error',
        });
      }
    };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className={cn(
        `
          booking-flow

          min-h-screen
          w-full

          bg-surface

          text-ink
        `,

        selectedRoomLines.length >
          0 &&
          'pb-24 lg:pb-0'
      )}
    >
      {/* ===================================================
          HOTEL HEADER
      =================================================== */}

      <HotelHeader
        hotel={hotel}
        onShare={
          shareHotel
        }
      />

      {/* ===================================================
          GALLERY
      =================================================== */}

      <HotelGallery
        hotelName={
          hotel.TenKhachSan
        }
        images={
          hotel.HinhAnh
        }
        onOpen={
          setGalleryIndex
        }
      />

      {/* ===================================================
          FULL GALLERY
      =================================================== */}

      <HotelGalleryDialog
        hotelName={
          hotel.TenKhachSan
        }
        images={
          hotel.HinhAnh
        }
        startIndex={
          galleryIndex
        }
        onClose={() =>
          setGalleryIndex(
            null
          )
        }
      />

      {/* ===================================================
          MOBILE BOOKING SUMMARY
      =================================================== */}

      {selectedRoomLines.length >
        0 &&
        !bookingPanelVisible && (
          <MobileBookingBar
            roomCount={
              selectedRoomCount
            }
            total={
              summaryTotal
            }
            onOpenPanel={
              goToBookingPanel
            }
          />
        )}

      {/* ===================================================
          SECTION NAV
      =================================================== */}

      <HotelSectionNav
        sections={
          PAGE_SECTIONS
        }
        activeId={
          activeSection
        }
        onSelect={
          selectSection
        }
      />

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <div
        className="
          page-container
          py-8
        "
      >
        {/* =================================================
            1. OVERVIEW
        ================================================= */}

        <div
          className="
            hotel-detail-content
          "
        >
          <HotelOverview
            hotel={hotel}
          />
        </div>

        {/* =================================================
            2. AMENITIES
        ================================================= */}

        <div
          className="
            hotel-detail-content
            mt-8
          "
        >
          <HotelAmenities
            hotel={hotel}
          />
        </div>

        {/* =================================================
            3. ROOMS + BOOKING
        ================================================= */}

        <div
          className="
            mt-8

            grid
            grid-cols-1

            gap-8

            items-start

            lg:grid-cols-12
          "
        >
          {/* ===============================================
              ROOM LIST
          =============================================== */}

          <div
            className="
              hotel-detail-content

              lg:col-span-8
            "
          >
            <RoomList
              search={{
                checkIn,
                checkOut,
                guests,
              }}

              onSearch={
                onDatesSubmit
              }

              roomsQuery={
                roomsQuery
              }

              selectedRooms={
                selectedRooms
              }

              onQuantityChange={
                setRoomQuantity
              }
            />
          </div>

          {/* ===============================================
              BOOKING PANEL
          =============================================== */}

          <div
            className="
              relative

              lg:col-span-4
            "
          >
            <BookingPanel
              roomTypeCount={
                selectedRoomLines.length
              }

              roomCount={
                selectedRoomCount
              }

              quoteQuery={
                quoteQuery
              }

              quoteMatchesSelection={
                quoteMatchesSelection
              }

              quoteMatchesPromo={
                quoteMatchesPromo
              }

              promoCode={
                promoCode
              }

              onPromoCodeChange={
                changePromoCode
              }

              onApplyPromo={
                applyPromo
              }

              note={
                ghiChu
              }

              onNoteChange={
                setGhiChu
              }

              bookingError={
                bookingMutation.isError
                  ? bookingMutation.error
                  : null
              }

              isBooking={
                bookingMutation.isPending
              }

              isSignedIn={
                Boolean(
                  accessToken
                )
              }

              isCustomer={
                role ===
                ROLE_NAMES.CUSTOMER
              }

              onSignIn={() =>
                navigate(
                  '/login',

                  {
                    state: {
                      from: {
                        pathname:
                          `/hotels/${hotelId}`,

                        search:
                          window
                            .location
                            .search,
                      },
                    },
                  }
                )
              }

              onBook={
                confirmBooking
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}