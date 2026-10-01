import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useHotelDetail, useHotelRooms } from '../../features/hotels/hooks';
import { defaultSearchDates, parseGuests } from '../../features/hotels/schemas';
import { useQuote } from '../../features/quotes/hooks';
import { quoteMatchesRequest } from '../../features/quotes/match';
import { useCreateBooking } from '../../features/bookings/hooks';
import { useAuthStore } from '../../lib/authStore';
import { ROLE_NAMES } from '../../lib/roles';
import { ApiError } from '../../services/apiClient';
import { formatCurrencyVND, cn } from '../../lib/utils';
import { HotelHeader } from '../../components/hotels/detail/HotelHeader';
import { HotelGallery } from '../../components/hotels/detail/HotelGallery';
import { HotelSectionNav } from '../../components/hotels/detail/HotelSectionNav';
import { RoomList } from '../../components/hotels/detail/RoomList';
import { HotelOverview, HotelAmenities } from '../../components/hotels/detail/HotelAbout';
import { BookingPanel } from '../../components/hotels/detail/BookingPanel';
import { MobileBookingBar } from '../../components/hotels/detail/MobileBookingBar';
import { HotelGalleryDialog } from '../../components/hotels/HotelGalleryDialog';
import { useToast } from '../../components/common/FeedbackProvider';
import { shareUrl } from '../../lib/share';
import { useActiveSection } from '../../hooks/useActiveSection';
import { PageSpinner } from '../../components/common/PageSpinner';

/** In the order they appear on the page; the sticky tabs use the same list. */
const PAGE_SECTIONS = [
  { id: 'loai-phong', label: 'Loại phòng & Giá' },
  { id: 'tong-quan', label: 'Tổng quan' },
  { id: 'tien-nghi', label: 'Tiện nghi' },
] as const;
const SECTION_IDS = PAGE_SECTIONS.map((section) => section.id);

export default function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const hotelId = Number(id);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRooms, setSelectedRooms] = useState<Record<number, number>>({});
  const [promoCode, setPromoCode] = useState('');
  // The promo code the quote is requested with. It follows the typed code when "Áp dụng" is pressed or the rooms change.
  const [appliedPromo, setAppliedPromo] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const notify = useToast();
  const bookingMutation = useCreateBooking(hotelId);
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);

  const defaults = defaultSearchDates();
  const checkIn = searchParams.get('checkIn') || defaults.checkIn;
  const checkOut = searchParams.get('checkOut') || defaults.checkOut;
  const guests = parseGuests(searchParams.get('guests'));
  const selectedRoomLines = Object.entries(selectedRooms)
    .map(([maLoaiPhong, soLuong]) => ({ maLoaiPhong: Number(maLoaiPhong), soLuong }))
    .filter((line) => line.soLuong > 0);
  const selectedRoomCount = selectedRoomLines.reduce((sum, line) => sum + line.soLuong, 0);
  const quoteQuery = useQuote(hotelId, selectedRoomLines.length > 0 ? { checkIn, checkOut, rooms: selectedRoomLines, promoCode: appliedPromo || undefined } : null);

  const hotelQuery = useHotelDetail(hotelId);
  const hotelLoaded = Boolean(hotelQuery.data);
  const [activeSection, selectSection] = useActiveSection(SECTION_IDS, hotelLoaded);
  // The mobile summary bar is redundant while the booking panel itself is on screen.
  const [bookingPanelVisible, setBookingPanelVisible] = useState(false);
  useEffect(() => {
    const panel = document.getElementById('dat-phong');
    if (!panel || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setBookingPanelVisible(entry.isIntersecting));
    observer.observe(panel);
    return () => observer.disconnect();
  }, [hotelLoaded]);
  const roomsQuery = useHotelRooms(hotelId, { checkIn, checkOut, guests });

  const onDatesSubmit = (values: { checkIn: string; checkOut: string; guests: number }) => {
    setSelectedRooms({});
    bookingMutation.reset();
    setSearchParams({ checkIn: values.checkIn, checkOut: values.checkOut, guests: String(values.guests) });
  };

  const setRoomQuantity = (maLoaiPhong: number, quantity: number, available: number) => {
    bookingMutation.reset();
    setAppliedPromo(promoCode.trim());
    const safeQuantity = Math.min(available, Math.max(0, Math.floor(Number.isFinite(quantity) ? quantity : 0)));
    setSelectedRooms((current) => {
      const next = { ...current };
      if (safeQuantity === 0) delete next[maLoaiPhong];
      else next[maLoaiPhong] = safeQuantity;
      return next;
    });
  };

  const changePromoCode = (value: string) => {
    setPromoCode(value);
    if (!value.trim()) setAppliedPromo('');
  };

  const applyPromo = () => {
    bookingMutation.reset();
    setAppliedPromo(promoCode.trim());
  };

  const quoteMatchesSelection = quoteMatchesRequest(quoteQuery.data, { checkIn, checkOut, rooms: selectedRoomLines });
  const quoteMatchesPromo = appliedPromo === promoCode.trim();

  const confirmBooking = () => {
    if (selectedRoomLines.length === 0 || !quoteMatchesSelection || !quoteQuery.data?.KhaDung) return;
    bookingMutation.mutate(
      {
        checkIn,
        checkOut,
        rooms: selectedRoomLines,
        promoCode: quoteQuery.data.PromoHopLe ? appliedPromo : undefined,
        ghiChu: ghiChu.trim() || undefined,
      },
      {
        onSuccess: (booking) => {
          navigate(`/bookings/${booking.MaDatPhong}`, { state: { justBooked: true } });
        },
      }
    );
  };

  if (hotelQuery.isLoading) return <PageSpinner />;

  if (hotelQuery.isError || !hotelQuery.data) {
    return (
      <div role="alert" className="mx-auto max-w-md mt-8 rounded-lg bg-danger-light px-4 py-3 text-center text-sm text-danger-ink">
        {hotelQuery.error instanceof ApiError ? hotelQuery.error.message : 'Không tìm thấy khách sạn'}
      </div>
    );
  }

  const hotel = hotelQuery.data;
  const goToBookingPanel = () => document.getElementById('dat-phong')?.scrollIntoView({ block: 'start' });
  const summaryTotal = quoteQuery.isError
    ? 'Không thể báo giá'
    : quoteMatchesSelection && quoteQuery.data
      ? (quoteQuery.data.KhaDung ? formatCurrencyVND(quoteQuery.data.TongTienThanhToan) : 'Cần điều chỉnh lựa chọn')
      : 'Đang cập nhật báo giá…';

  const shareHotel = async () => {
    try {
      const result = await shareUrl({ title: hotel.TenKhachSan, url: window.location.href });
      if (result === 'copied') notify({ title: 'Đã sao chép liên kết', tone: 'success' });
    } catch {
      notify({ title: 'Không thể chia sẻ', description: 'Hãy sao chép liên kết từ thanh địa chỉ của trình duyệt.', tone: 'error' });
    }
  };

  return (
    <div className={cn('booking-flow bg-surface text-ink min-h-screen w-full', selectedRoomLines.length > 0 && 'pb-24 lg:pb-0')}>
      <HotelHeader hotel={hotel} onShare={shareHotel} />
      <HotelGallery hotelName={hotel.TenKhachSan} images={hotel.HinhAnh} onOpen={setGalleryIndex} />
      <HotelGalleryDialog hotelName={hotel.TenKhachSan} images={hotel.HinhAnh} startIndex={galleryIndex} onClose={() => setGalleryIndex(null)} />

      {selectedRoomLines.length > 0 && !bookingPanelVisible && (
        <MobileBookingBar roomCount={selectedRoomCount} total={summaryTotal} onOpenPanel={goToBookingPanel} />
      )}

      <HotelSectionNav sections={PAGE_SECTIONS} activeId={activeSection} onSelect={selectSection} />

      <div className="page-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="hotel-detail-content lg:col-span-8 flex flex-col gap-8">
            <RoomList
              search={{ checkIn, checkOut, guests }}
              onSearch={onDatesSubmit}
              roomsQuery={roomsQuery}
              selectedRooms={selectedRooms}
              onQuantityChange={setRoomQuantity}
            />
            <HotelOverview hotel={hotel} />
            <HotelAmenities hotel={hotel} />
          </div>

          <div className="lg:col-span-4 relative">
            <BookingPanel
              roomTypeCount={selectedRoomLines.length}
              roomCount={selectedRoomCount}
              quoteQuery={quoteQuery}
              quoteMatchesSelection={quoteMatchesSelection}
              quoteMatchesPromo={quoteMatchesPromo}
              promoCode={promoCode}
              onPromoCodeChange={changePromoCode}
              onApplyPromo={applyPromo}
              note={ghiChu}
              onNoteChange={setGhiChu}
              bookingError={bookingMutation.isError ? bookingMutation.error : null}
              isBooking={bookingMutation.isPending}
              isSignedIn={Boolean(accessToken)}
              isCustomer={role === ROLE_NAMES.CUSTOMER}
              onSignIn={() => navigate('/login', { state: { from: { pathname: `/hotels/${hotelId}`, search: window.location.search } } })}
              onBook={confirmBooking}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
