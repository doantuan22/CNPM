import { Link } from 'react-router-dom';
import type { HotelDetail } from '../../../features/hotels/types';
import { Button } from '../../common/Button';
import { Icon } from '../../common/Icon';
import { cn } from '../../../lib/utils';

/**
 * Breadcrumb, hotel name, star rating,
 * address and the share action.
 */
export function HotelHeader({
  hotel,
  onShare,
}: {
  hotel: HotelDetail;
  onShare: () => void;
}) {
  return (
    <>
      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <section className="bg-surface-secondary border-b border-border/80">
        <div className="page-container py-3 flex items-center text-xs">
          <nav
            aria-label="Đường dẫn"
            className="
              flex
              items-center
              gap-2
              text-ink-muted
              overflow-x-auto
              py-1
            "
          >
            <Link
              to="/"
              className="
                hover:text-primary
                font-medium
                transition-colors
                whitespace-nowrap
              "
            >
              Trang chủ
            </Link>

            <Icon
              name="caret-right"
              className="text-sm text-border-strong flex-shrink-0"
            />

            <Link
              to="/hotels"
              className="
                hover:text-primary
                font-medium
                transition-colors
                whitespace-nowrap
              "
            >
              Khách sạn
            </Link>

            <Icon
              name="caret-right"
              className="text-sm text-border-strong flex-shrink-0"
            />

            <span
              className="
                font-semibold
                text-ink
                truncate
                max-w-[200px]
                sm:max-w-none
              "
            >
              {hotel.TenKhachSan}
            </span>
          </nav>
        </div>
      </section>

      {/* =====================================================
          HOTEL INFORMATION
      ===================================================== */}

      <section className="pt-6 pb-5 bg-surface">
        <div
          className="
            page-container
            flex
            flex-col
            lg:flex-row
            lg:items-end
            justify-between
            gap-5
          "
        >
          {/* LEFT */}

          <div className="min-w-0">
            {/* STAR RATING */}

            <div className="flex items-center gap-2.5 mb-2">
              <div
                className="flex items-center text-warning gap-0.5"
                aria-hidden="true"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <Icon
                    key={i}
                    name="star"
                    weight={
                      i < hotel.HangSao
                        ? 'fill'
                        : 'regular'
                    }
                    className={cn(
                      'text-base',
                      i >= hotel.HangSao &&
                        'text-border-strong'
                    )}
                  />
                ))}
              </div>

              <span
                className="
                  px-2.5
                  py-0.5
                  rounded-full
                  text-[11px]
                  font-semibold
                  bg-primary-50
                  text-primary
                  border
                  border-primary-200
                "
              >
                {hotel.HangSao} Sao
              </span>
            </div>

            {/* HOTEL NAME */}

            <h1
              className="
                text-2xl
                sm:text-3xl
                lg:text-4xl
                font-extrabold
                text-ink
                tracking-tight
              "
            >
              {hotel.TenKhachSan}
            </h1>

            {/* ADDRESS */}

            <p
              className="
                flex
                items-start
                flex-wrap
                gap-2
                text-sm
                text-ink-muted
                mt-2
                leading-6
              "
            >
              <Icon
                name="map-pin"
                className="
                  text-base
                  text-primary
                  flex-shrink-0
                  mt-0.5
                "
              />

              <span>
                {hotel.DiaChiChiTiet}
              </span>
            </p>
          </div>

          {/* SHARE */}

          <Button
            type="button"
            variant="outline"
            aria-label="Chia sẻ"
            onClick={onShare}
            className="self-start lg:self-end"
          >
            <Icon name="share-network" />

            <span className="hidden sm:inline">
              Chia sẻ
            </span>
          </Button>
        </div>
      </section>
    </>
  );
}