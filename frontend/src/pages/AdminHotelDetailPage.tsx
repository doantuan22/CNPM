import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useState } from 'react';
import { ApiError } from '../services/apiClient';
import { getAdminHotel, reactivateAdminHotel, suspendAdminHotel, updateAdminHotel, type UpdateAdminHotelPayload } from '../features/admin/hotels/api';
import { Button } from '../components/common/Button';

export default function AdminHotelDetailPage() {
  const id = Number(useParams().id); const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['admin', 'hotels', id], queryFn: () => getAdminHotel(id) });
  const [saved, setSaved] = useState(false);
  const mutation = useMutation({ mutationFn: ({ action, payload }: { action: 'update' | 'suspend' | 'reactivate'; payload?: Partial<UpdateAdminHotelPayload> }) => action === 'update' ? updateAdminHotel(id, payload ?? {}) : action === 'suspend' ? suspendAdminHotel(id) : reactivateAdminHotel(id), onSuccess: () => { setSaved(true); queryClient.invalidateQueries({ queryKey: ['admin', 'hotels'] }); } });
  useEffect(() => { if (mutation.isError) setSaved(false); }, [mutation.isError]);
  if (query.isLoading) return <div role="status">Đang tải...</div>;
  if (query.isError || !query.data) return <div role="alert">{query.error instanceof ApiError ? query.error.message : 'Không tìm thấy khách sạn'}</div>;
  const hotel = query.data;
  const onSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSaved(false); const form = new FormData(event.currentTarget); mutation.mutate({ action: 'update', payload: { TenKhachSan: String(form.get('TenKhachSan')), DiaChiChiTiet: String(form.get('DiaChiChiTiet')), HangSao: Number(form.get('HangSao')), MoTa: String(form.get('MoTa')) || null } }); };
  const suspend = () => { if (window.confirm('Đình chỉ khách sạn này?')) mutation.mutate({ action: 'suspend' }); };
  const reactivate = () => { if (window.confirm('Kích hoạt lại khách sạn này?')) mutation.mutate({ action: 'reactivate' }); };
  return <div className="mx-auto max-w-2xl space-y-5"><Link className="text-blue-600" to="/admin/hotels">← Danh sách khách sạn</Link><h1 className="text-2xl font-bold">{hotel.TenKhachSan}</h1><p>Trạng thái: <strong>{hotel.TrangThai}</strong></p>
    {mutation.isError && <p role="alert">{mutation.error instanceof ApiError ? mutation.error.message : 'Không thể cập nhật khách sạn'}</p>}{saved && <p role="status">Đã lưu thay đổi.</p>}
    <form className="space-y-3 rounded-xl border bg-white p-5" onSubmit={onSubmit}><label className="block">Tên khách sạn<input required name="TenKhachSan" defaultValue={hotel.TenKhachSan} className="mt-1 block w-full rounded border p-2" /></label><label className="block">Địa chỉ<input required name="DiaChiChiTiet" defaultValue={hotel.DiaChiChiTiet} className="mt-1 block w-full rounded border p-2" /></label><label className="block">Hạng sao<input required name="HangSao" type="number" min="1" max="5" defaultValue={hotel.HangSao} className="mt-1 block w-full rounded border p-2" /></label><label className="block">Mô tả<textarea name="MoTa" defaultValue={hotel.MoTa ?? ''} className="mt-1 block w-full rounded border p-2" /></label><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</Button></form>
    {hotel.TrangThai === 'Đình chỉ' ? <Button onClick={reactivate} disabled={mutation.isPending}>Kích hoạt lại</Button> : <Button onClick={suspend} disabled={mutation.isPending}>Đình chỉ</Button>}
  </div>;
}
