import type { HotelDetail } from '../../../features/hotels/types';
import { Card } from '../../common/Card';
import { Icon } from '../../common/Icon';

/* =========================================================
   HOTEL OVERVIEW
========================================================= */

/**
 * "Tổng quan":
 * chỉ hiển thị phần giới thiệu / mô tả khách sạn.
 */
export function HotelOverview({
  hotel,
}: {
  hotel: HotelDetail;
}) {
  return (
    <section
      id="tong-quan"
      className="pt-2 scroll-mt-36"
    >
      <Card className="sm:p-8">
        {/* HEADER */}

        <div
          className="
            flex
            items-start
            gap-3
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              flex-shrink-0
              items-center
              justify-center
              rounded-xl
              bg-primary-50
              text-primary
            "
          >
            <Icon
              name="info"
              size={22}
            />
          </div>

          <div className="min-w-0">
            <h2
              className="
                text-xl
                sm:text-2xl
                font-bold
                text-ink
                tracking-tight
              "
            >
              Tổng quan về {hotel.TenKhachSan}
            </h2>
          </div>
        </div>

        {/* DESCRIPTION */}

        <div
          className="
            mt-5
            pt-5
            border-t
            border-border
          "
        >
          <p
            className="
              text-ink-muted
              text-sm
              sm:text-base
              leading-7
              whitespace-pre-line
              max-w-4xl
            "
          >
            {hotel.MoTa ??
              'Khách sạn chưa cập nhật mô tả chi tiết.'}
          </p>
        </div>
      </Card>
    </section>
  );
}

/* =========================================================
   HOTEL AMENITIES
========================================================= */

/**
 * "Tiện nghi & Dịch vụ":
 * hiển thị toàn bộ tiện nghi trả về từ hotel.TienNghi.
 */
export function HotelAmenities({
  hotel,
}: {
  hotel: HotelDetail;
}) {
  return (
    <section
      id="tien-nghi"
      className="pt-2 scroll-mt-36"
    >
      <Card className="sm:p-8">
        {/* HEADER */}

        <div className="mb-6">
          <h2
            className="
              text-xl
              sm:text-2xl
              font-bold
              text-ink
              tracking-tight
            "
          >
            Tiện nghi & Dịch vụ
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-ink-muted
              leading-6
            "
          >
            Các tiện nghi hiện có tại khách sạn.
          </p>
        </div>

        {/* AMENITIES */}

        {hotel.TienNghi.length > 0 ? (
          <ul
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-3
            "
          >
            {hotel.TienNghi.map((a) => (
              <li
                key={a.MaTienNghi}
                className="
                  flex
                  items-center
                  gap-3

                  min-h-[56px]

                  px-4
                  py-3

                  rounded-xl

                  bg-surface-secondary

                  border
                  border-transparent

                  transition-all
                  duration-200

                  hover:bg-primary-50
                  hover:border-primary-100
                "
              >
                <Icon
                  name="check-circle"
                  className="
                    text-xl
                    text-primary
                    flex-shrink-0
                  "
                />

                <span
                  className="
                    text-sm
                    font-semibold
                    text-ink
                    leading-5
                  "
                >
                  {a.TenTienNghi}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div
            className="
              rounded-xl
              bg-surface-secondary
              px-5
              py-6
              text-sm
              text-ink-muted
              text-center
            "
          >
            Khách sạn chưa cập nhật tiện nghi.
          </div>
        )}
      </Card>
    </section>
  );
}