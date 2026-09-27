import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createAccount } from '../features/admin/accounts/api';
import { ApiError } from '../services/apiClient';

export default function AdminCreateAccountPage() {
  const nav = useNavigate();
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(undefined);
    const d = new FormData(e.currentTarget);
    try {
      await createAccount({
        TenDangNhap: String(d.get('TenDangNhap')),
        Email: String(d.get('Email')),
        MatKhau: String(d.get('MatKhau')),
        HoTen: String(d.get('HoTen')),
        SoDienThoai: String(d.get('SoDienThoai')),
        MaVaiTro: Number(d.get('MaVaiTro')),
      });
      nav('/admin/accounts');
    } catch (x) {
      setError(x instanceof ApiError ? x.message : 'Không thể tạo tài khoản');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[600px] mx-auto w-full">
      <Link to="/admin/accounts" className="breadcrumb w-fit">
        <i className="ph ph-arrow-left"></i>
        <span>Quay lại danh sách</span>
      </Link>

      <div className="bg-white border border-border rounded-[16px] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-slate-50 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
            <i className="ph ph-user-plus text-[20px]"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-heading">Thêm mới tài khoản</h3>
            <p className="text-xs text-slate-500 mt-0.5">Khởi tạo định danh người dùng và cấp quyền sử dụng hệ thống.</p>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div role="alert" className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium flex items-start gap-2">
              <i className="ph-fill ph-warning-circle text-rose-500 mt-0.5"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block">Họ và tên <span className="text-rose-500">*</span></label>
              <input type="text" name="HoTen" required placeholder="Ví dụ: Hoàng Văn Nam" className="w-full px-3 py-2 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">Tên đăng nhập <span className="text-rose-500">*</span></label>
                <input type="text" name="TenDangNhap" required placeholder="Ví dụ: hoangnam123" className="w-full px-3 py-2 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">Địa chỉ Email <span className="text-rose-500">*</span></label>
                <input type="email" name="Email" required placeholder="nam.hoang@example.com" className="w-full px-3 py-2 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">Số điện thoại <span className="text-rose-500">*</span></label>
                <input type="tel" name="SoDienThoai" required placeholder="0912 345 890" className="w-full px-3 py-2 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">Vai trò hệ thống <span className="text-rose-500">*</span></label>
                <select name="MaVaiTro" required defaultValue="" className="w-full px-3 py-2 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition">
                  <option value="" disabled>Chọn vai trò</option>
                  <option value="1">Khách hàng du lịch (Traveler)</option>
                  <option value="2">Chủ khách sạn (Partner)</option>
                  <option value="3">Quản trị viên (SuperAdmin)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block">Mật khẩu ban đầu <span className="text-rose-500">*</span></label>
              <input type="password" name="MatKhau" required placeholder="••••••••••••" className="w-full px-3 py-2 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" />
              <span className="text-[10px] text-slate-400 mt-1 block">Tối thiểu 6 ký tự.</span>
            </div>

            <div className="p-3 bg-slate-50 border border-border rounded-xl flex items-start gap-2.5 mt-2">
              <input type="checkbox" id="sendInviteMail" defaultChecked className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary" />
              <label htmlFor="sendInviteMail" className="text-[11px] text-slate-600 leading-tight">
                Gửi email thông báo kích hoạt tài khoản kèm hướng dẫn đăng nhập tự động đến hòm thư người dùng.
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-border">
              <Link to="/admin/accounts" className="px-4 py-2 bg-white text-slate-700 border border-border rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                Hủy bỏ
              </Link>
              <button type="submit" disabled={saving} className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark shadow-sm transition disabled:opacity-50">
                {saving ? 'Đang tạo...' : 'Lưu tài khoản'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
