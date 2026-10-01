import { useState, type FormEvent } from 'react';
import { Icon } from '../../components/common/Icon';
import { Link } from 'react-router-dom';
import { OwnerScopeGate } from '../../components/owner/OwnerScopeGate';
import { StatusBadge } from '../../components/domain/StatusBadge';
import { useCreateRoomType, useRoomTypes } from '../../features/owner/hooks';
import { OwnerHotel, OwnerRoomType } from '../../features/owner/types';
import { ApiError } from '../../services/apiClient';
import { useScopedHotels } from '../../components/owner/useScopedHotels';
import { Button } from '../../components/common/Button';

export default function OwnerRoomTypesPage() {
  const scope = useScopedHotels();
  const roomTypes = useRoomTypes(scope.hotelId ?? 0);
  const create = useCreateRoomType(scope.hotelId ?? 0);
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');
  const visible = (roomTypes.data ?? []).filter((item) =>
    item.TenLoaiPhong.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))
  );
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    const data = new FormData(event.currentTarget);
    try {
      await create.mutateAsync({
        TenLoaiPhong: String(data.get('name') ?? '').trim(),
        LoaiGiuong: String(data.get('bed') ?? '').trim(),
        SoGiuong: Number(data.get('beds')),
        SucChua: Number(data.get('capacity')),
        DienTich: Number(data.get('area')),
      });
      event.currentTarget.reset();
      setAdding(false);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Không thể tạo loại phòng.');
    }
  };
  return (
    <div className="owner-module space-y-6">
      <header className="owner-module__header">
        <div className="owner-module__title">
          <span className="owner-module__icon">
            <Icon name="bed" size={20} />
          </span>
          <div>
            <h1>Loại phòng</h1>
            <p>Cấu hình các hạng phòng trong từng khách sạn.</p>
          </div>
        </div>
        {scope.hotelId && (
          <Button type="button" onClick={() => setAdding((value) => !value)}>
            <Icon name="plus" size={16} /> Thêm loại phòng
          </Button>
        )}
      </header>
      <OwnerScopeGate scope={scope} prompt="Chọn khách sạn để xem các loại phòng trong module này." />
      {scope.hotelId && (
        <>
          <div className="owner-module__toolbar">
            <label className="owner-module__search">
              <Icon name="magnifying-glass" size={17} />
              <input
                type="search"
                aria-label="Tìm loại phòng"
                placeholder="Tìm loại phòng"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <span>{roomTypes.data?.length ?? 0} loại phòng</span>
          </div>
          {adding && (
            <form className="owner-module__form" onSubmit={submit}>
              <h2>Thêm loại phòng</h2>
              {formError && <p role="alert">{formError}</p>}
              <div className="owner-module__form-grid">
                <label>
                  Tên loại phòng
                  <input name="name" minLength={2} maxLength={150} required />
                </label>
                <label>
                  Loại giường
                  <input name="bed" maxLength={50} required />
                </label>
                <label>
                  Số giường
                  <input name="beds" type="number" min="1" defaultValue="1" required />
                </label>
                <label>
                  Sức chứa
                  <input name="capacity" type="number" min="1" defaultValue="2" required />
                </label>
                <label>
                  Diện tích (m²)
                  <input name="area" type="number" min="0.1" step="0.1" required />
                </label>
              </div>
              <Button disabled={create.isPending}>
                {create.isPending ? 'Đang tạo…' : 'Tạo loại phòng'}
              </Button>
            </form>
          )}
          {roomTypes.isLoading ? (
            <div role="status" className="owner-scope-state">
              Đang tải loại phòng…
            </div>
          ) : roomTypes.isError ? (
            <div className="owner-scope-state is-error" role="alert">
              {roomTypes.error instanceof ApiError ? roomTypes.error.message : 'Không thể tải loại phòng.'}
            </div>
          ) : visible.length === 0 ? (
            <div className="owner-scope-state">{search ? 'Không có loại phòng khớp từ khóa.' : 'Khách sạn này chưa có loại phòng.'}</div>
          ) : (
            <div className="owner-room-type-list">
              {visible.map((room) => (
                <RoomTypeRow key={room.MaLoaiPhong} room={room} hotel={scope.hotel!} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RoomTypeRow({ room, hotel }: { room: OwnerRoomType; hotel: OwnerHotel }) {
  return (
    <Link className="owner-room-type-row" to={`/owner/room-types/${room.MaLoaiPhong}?hotelId=${hotel.MaKhachSan}`}>
      <span className="owner-room-type-row__image">
        {room.HINH_ANH_LOAI_PHONG[0]?.URL ? (
          <img src={room.HINH_ANH_LOAI_PHONG[0].URL} alt="" />
        ) : (
          <Icon name="bed" size={21} />
        )}
      </span>
      <span className="owner-room-type-row__main">
        <strong>{room.TenLoaiPhong}</strong>
        <small>
          {room.SucChua} khách · {room.DienTich} m² · {room.SoGiuong} giường {room.LoaiGiuong}
        </small>
      </span>
      <StatusBadge domain="roomType" status={room.TrangThai} />
      <span className="owner-room-type-row__action">
        Chỉnh sửa <span aria-hidden="true">›</span>
      </span>
    </Link>
  );
}
