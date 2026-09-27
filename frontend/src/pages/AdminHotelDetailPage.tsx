import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useState } from 'react';
import { ApiError } from '../services/apiClient';
import { getAdminHotel, reactivateAdminHotel, suspendAdminHotel, updateAdminHotel, type UpdateAdminHotelPayload } from '../features/admin/hotels/api';

export default function AdminHotelDetailPage() {
  const id = Number(useParams().id); 
  const queryClient = useQueryClient();
  
  const query = useQuery({ queryKey: ['admin', 'hotels', id], queryFn: () => getAdminHotel(id) });
  
  const [saved, setSaved] = useState(false);
  const mutation = useMutation({ 
    mutationFn: ({ action, payload }: { action: 'update' | 'suspend' | 'reactivate'; payload?: Partial<UpdateAdminHotelPayload> }) => 
      action === 'update' ? updateAdminHotel(id, payload ?? {}) : action === 'suspend' ? suspendAdminHotel(id) : reactivateAdminHotel(id), 
    onSuccess: () => { setSaved(true); queryClient.invalidateQueries({ queryKey: ['admin', 'hotels'] }); } 
  });
  
  useEffect(() => { if (mutation.isError) setSaved(false); }, [mutation.isError]);
  
  if (query.isLoading) return <div className="flex justify-center py-16"><div className="spinner"></div></div>;
  if (query.isError || !query.data) return <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700 border border-red-200">{query.error instanceof ApiError ? query.error.message : 'Không tìm thấy khách sạn'}</div>;
  
  const hotel = query.data;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => { 
    event.preventDefault(); 
    setSaved(false); 
    const form = new FormData(event.currentTarget); 
    mutation.mutate({ 
      action: 'update', 
      payload: { 
        TenKhachSan: String(form.get('TenKhachSan')), 
        DiaChiChiTiet: String(form.get('DiaChiChiTiet')), 
        HangSao: Number(form.get('HangSao')), 
        MoTa: String(form.get('MoTa')) || null 
      } 
    }); 
  };
  
  const suspend = () => { if (window.confirm('Đình chỉ khách sạn này? Cơ sở sẽ không thể tiếp nhận đặt phòng mới.')) mutation.mutate({ action: 'suspend' }); };
  const reactivate = () => { if (window.confirm('Kích hoạt lại khách sạn này?')) mutation.mutate({ action: 'reactivate' }); };
  
  const isActive = hotel.TrangThai === 'Hoạt động';

  return (
    <div className="flex flex-col gap-6 max-w-[800px] mx-auto w-full">
      <Link to="/admin/hotels" className="breadcrumb w-fit">
        <i className="ph ph-arrow-left"></i>
        <span>Quay lại danh sách</span>
      </Link>

      <div className="bg-white border border-border rounded-[16px] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
              <i className="ph-fill ph-buildings text-[24px]"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-heading">{hotel.TenKhachSan}</h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  {hotel.TrangThai}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">Mã cơ sở: #{hotel.MaKhachSan}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {mutation.isSuccess && saved && (
            <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
              Cập nhật khách sạn thành công
            </div>
          )}
          {mutation.isError && (
            <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
              Thao tác thất bại, vui lòng thử lại
            </div>
          )}

          {/* Form Thông tin */}
          <div className="bg-slate-50 border border-border rounded-2xl p-5 space-y-3">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <i className="ph-fill ph-info text-primary"></i> Thông tin cơ sở & Chính sách
            </h4>
            
            <form onSubmit={onSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">Tên khách sạn <span className="text-rose-500">*</span></label>
                <input type="text" name="TenKhachSan" defaultValue={hotel.TenKhachSan} required className="w-full px-3 py-2 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">Địa phương</label>
                  <input type="text" readOnly value={hotel.DIA_PHUONG?.TenThanhPho ?? '—'} className="w-full px-3 py-2 bg-slate-100 border border-border rounded-xl text-sm text-slate-500 outline-none cursor-not-allowed" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">Hạng sao <span className="text-rose-500">*</span></label>
                  <select name="HangSao" defaultValue={hotel.HangSao} required className="w-full px-3 py-2 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition">
                    <option value="5">★★★★★ (5 sao)</option>
                    <option value="4">★★★★☆ (4 sao)</option>
                    <option value="3">★★★☆☆ (3 sao)</option>
                    <option value="2">★★☆☆☆ (2 sao)</option>
                    <option value="1">★☆☆☆☆ (1 sao)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">Địa chỉ chi tiết <span className="text-rose-500">*</span></label>
                <input type="text" name="DiaChiChiTiet" defaultValue={hotel.DiaChiChiTiet} required className="w-full px-3 py-2 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">Mô tả cơ sở</label>
                <textarea name="MoTa" defaultValue={hotel.MoTa ?? ''} rows={4} className="w-full px-3 py-2 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition resize-none"></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={mutation.isPending} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark shadow-sm transition disabled:opacity-50 flex items-center gap-2">
                  <i className="ph ph-floppy-disk"></i> {mutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>

          {/* Quản lý Trạng thái */}
          <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <i className="ph-fill ph-shield-warning text-amber-500"></i> Quản lý vận hành & Trạng thái
            </h4>
            <div className="text-xs text-slate-500 leading-relaxed mb-3">
              Đình chỉ khách sạn sẽ ẩn cơ sở khỏi kết quả tìm kiếm và ngăn chặn các đặt phòng mới. Tuy nhiên, các đặt phòng hiện tại vẫn phải được khách sạn xử lý.
            </div>
            
            <div className="flex items-center gap-3 pt-1">
              {isActive ? (
                <button
                  type="button"
                  onClick={suspend}
                  disabled={mutation.isPending}
                  className="px-4 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm font-bold hover:bg-rose-100 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <i className="ph ph-prohibit"></i> {mutation.isPending ? 'Đang xử lý...' : 'Tạm đình chỉ hoạt động'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={reactivate}
                  disabled={mutation.isPending}
                  className="px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold hover:bg-emerald-100 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <i className="ph ph-check-circle"></i> {mutation.isPending ? 'Đang xử lý...' : 'Kích hoạt lại cơ sở'}
                </button>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
