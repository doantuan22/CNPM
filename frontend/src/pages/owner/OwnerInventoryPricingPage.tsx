import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CalendarDays } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { OwnerHotelContextSelector } from '../../components/owner/OwnerHotelContext';
import { useBulkUpsertRates, useRates, useRoomTypes } from '../../features/owner/hooks';
import { RateItemInput } from '../../features/owner/types';
import { formatCurrencyVND, toDateInputValue } from '../../lib/utils';
import { ApiError } from '../../services/apiClient';
import { useScopedHotels } from '../../components/owner/useScopedHotels';

export default function OwnerInventoryPricingPage() {
  const scope = useScopedHotels();
  const roomTypesQuery = useRoomTypes(scope.hotelId ?? 0);
  const [params, setParams] = useSearchParams();
  const roomTypeId = Number(params.get('roomTypeId') ?? roomTypesQuery.data?.[0]?.MaLoaiPhong ?? 0);
  const roomType = roomTypesQuery.data?.find((item) => item.MaLoaiPhong === roomTypeId);
  const start = toDateInputValue(new Date());
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 13);
  const [from, setFrom] = useState(start);
  const [to, setTo] = useState(toDateInputValue(endDate));
  const rates = useRates(roomType?.MaLoaiPhong ?? 0, from, to);
  const update = useBulkUpsertRates(roomType?.MaLoaiPhong ?? 0);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!roomTypesQuery.data?.length) return;
    const found = roomTypesQuery.data.some((item) => item.MaLoaiPhong === roomTypeId);
    if (!found) {
      const next = new URLSearchParams(params);
      next.set('roomTypeId', String(roomTypesQuery.data[0].MaLoaiPhong));
      setParams(next, { replace: true });
    }
  }, [params, roomTypeId, roomTypesQuery.data, setParams]);
  const rows = useMemo(() => rates.data ?? [], [rates.data]);
  const updateRange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!roomType || from > to) {
      setError('Chọn ngày hợp lệ và một loại phòng.');
      return;
    }
    const days = Math.floor((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000) + 1;
    if (days > 366) {
      setError('Mỗi lần cập nhật tối đa 366 ngày theo giới hạn hệ thống.');
      return;
    }
    const data = new FormData(event.currentTarget);
    const ratesPayload: RateItemInput[] = Array.from({ length: days }, (_, index) => {
      const date = new Date(Date.parse(`${from}T00:00:00Z`) + index * 86400000).toISOString().slice(0, 10);
      return {
        NgayApDung: date,
        GiaPhong: Number(data.get('price')),
        SoLuongPhong: Number(data.get('quantity')),
        TrangThai: String(data.get('status')),
      };
    });
    try {
      await update.mutateAsync(ratesPayload);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : 'Không thể cập nhật giá và quỹ phòng.');
    }
  };
  return (
    <div className="owner-module space-y-6">
      <header className="owner-module__header">
        <div className="owner-module__title">
          <span className="owner-module__icon">
            <CalendarDays size={20} />
          </span>
          <div>
            <h1>Quỹ phòng &amp; giá bán</h1>
            <p>Chỉnh sửa các mức giá và số lượng đã lưu theo ngày.</p>
          </div>
        </div>
      </header>
      <OwnerHotelContextSelector hotels={scope.hotels} hotelId={scope.hotelId} onChange={scope.selectHotel} />
      {scope.state}
      {!scope.hotelsQuery.isLoading && !scope.hotelsQuery.error && !scope.invalidHotelId && !scope.hotelId && scope.hotels.length > 1 && (
        <div className="owner-scope-state">Chọn khách sạn để tải dữ liệu quỹ phòng và giá bán.</div>
      )}
      {scope.hotelId && (
        <>
          {roomTypesQuery.isLoading ? (
            <div role="status" className="owner-scope-state">
              Đang tải loại phòng…
            </div>
          ) : roomTypesQuery.isError ? (
            <div role="alert" className="owner-scope-state is-error">
              Không thể tải loại phòng.
            </div>
          ) : roomTypesQuery.data?.length ? (
            <>
              <section className="owner-module__filters">
                <label>
                  Loại phòng
                  <select
                    aria-label="Loại phòng"
                    value={roomType?.MaLoaiPhong ?? ''}
                    onChange={(event) => {
                      const next = new URLSearchParams(params);
                      next.set('roomTypeId', event.target.value);
                      setParams(next);
                    }}
                  >
                    <option value="" disabled>
                      Chọn loại phòng
                    </option>
                    {roomTypesQuery.data.map((item) => (
                      <option key={item.MaLoaiPhong} value={item.MaLoaiPhong}>
                        {item.TenLoaiPhong}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Từ ngày
                  <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
                </label>
                <label>
                  Đến ngày
                  <input type="date" min={from} value={to} onChange={(event) => setTo(event.target.value)} />
                </label>
              </section>
              <section className="owner-module__data">
                <h2>{roomType?.TenLoaiPhong ?? 'Dữ liệu theo ngày'}</h2>
                {rates.isLoading ? (
                  <div role="status" className="owner-scope-state">
                    Đang tải dữ liệu ngày…
                  </div>
                ) : rates.isError ? (
                  <div role="alert" className="owner-scope-state is-error">
                    {rates.error instanceof ApiError ? rates.error.message : 'Không thể tải dữ liệu ngày.'}
                  </div>
                ) : rows.length ? (
                  <div className="owner-rate-table-wrap">
                    <table className="owner-rate-table">
                      <thead>
                        <tr>
                          <th>Ngày áp dụng</th>
                          <th>Giá phòng</th>
                          <th>Số lượng phòng</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.MaQuyPhong}>
                            <td>{new Date(`${row.NgayApDung.slice(0, 10)}T00:00:00`).toLocaleDateString('vi-VN')}</td>
                            <td>{formatCurrencyVND(row.GiaPhong)}</td>
                            <td>{row.SoLuongPhong}</td>
                            <td>{row.TrangThai}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="owner-scope-state">Không có bản ghi giá/quỹ trong khoảng ngày này.</p>
                )}
              </section>
              <form className="owner-module__form" onSubmit={updateRange}>
                <h2>Cập nhật toàn bộ khoảng ngày đã chọn</h2>
                <p>Gửi đúng ngày, giá, số lượng và trạng thái đến API hiện tại. Không tạo dữ liệu tồn kho suy diễn.</p>
                {error && (
                  <p role="alert" className="is-error">
                    {error}
                  </p>
                )}
                <div className="owner-module__form-grid">
                  <label>
                    Giá phòng
                    <input name="price" type="number" min="0" step="1000" required />
                  </label>
                  <label>
                    Số lượng phòng
                    <input name="quantity" type="number" min="0" step="1" required />
                  </label>
                  <label>
                    Trạng thái
                    <select name="status" defaultValue="Mở bán">
                      <option value="Mở bán">Mở bán</option>
                      <option value="Đóng bán">Đóng bán</option>
                    </select>
                  </label>
                </div>
                <button className="btn btn-primary" disabled={update.isPending || !roomType}>
                  {update.isPending ? 'Đang lưu…' : 'Cập nhật khoảng ngày'}
                </button>
              </form>
            </>
          ) : (
            <div className="owner-scope-state">Khách sạn này chưa có loại phòng để thiết lập giá.</div>
          )}
        </>
      )}
    </div>
  );
}
