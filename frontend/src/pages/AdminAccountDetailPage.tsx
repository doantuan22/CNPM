import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import {
  useAccountDetail,
  useUpdateAccount,
  useLockAccount,
  useUnlockAccount,
  useDeleteAccount,
} from '../features/admin/accounts/hooks';
import type { UpdateAccountPayload } from '../types/auth';
import { ApiError } from '../services/apiClient';

export default function AdminAccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const accountId = Number(id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const detailQuery = useAccountDetail(Number.isFinite(accountId) ? accountId : null);
  const updateMutation = useUpdateAccount();
  const lockMutation = useLockAccount();
  const unlockMutation = useUnlockAccount();
  const deleteMutation = useDeleteAccount();

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<UpdateAccountPayload>();

  useEffect(() => {
    if (detailQuery.data) {
      reset({
        HoTen: detailQuery.data.HoTen,
        SoDienThoai: detailQuery.data.SoDienThoai,
        NgaySinh: detailQuery.data.NgaySinh?.slice(0, 10) ?? '',
        GioiTinh: detailQuery.data.GioiTinh ?? undefined,
        Email: detailQuery.data.Email,
        TenDangNhap: detailQuery.data.TenDangNhap,
      });
    }
  }, [detailQuery.data, reset]);

  if (detailQuery.isLoading) {
    return (
      <div className="flex justify-center py-16" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">
        {detailQuery.error instanceof ApiError ? detailQuery.error.message : 'Không tìm thấy tài khoản'}
      </div>
    );
  }

  const account = detailQuery.data;
  const isLocked = account.TrangThai === 'Khóa';

  const onSubmit = (data: UpdateAccountPayload) =>
    updateMutation.mutate({
      id: accountId,
      payload: {
        ...data,
        NgaySinh: data.NgaySinh || undefined,
        GioiTinh: data.GioiTinh ? data.GioiTinh : undefined,
      },
    });

  const onDelete = async () => {
    const result = await deleteMutation.mutateAsync(accountId);
    if (result.hardDeleted) navigate('/admin/accounts', { replace: true });
    setConfirmDelete(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{account.HoTen}</h1>
          <p className="text-sm text-slate-500">Mã tài khoản #{account.MaTaiKhoan}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            isLocked ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}
        >
          {account.TrangThai}
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs space-y-6">
        {updateMutation.isSuccess && (
          <div role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            Cập nhật tài khoản thành công
          </div>
        )}
        {(updateMutation.isError || lockMutation.isError || unlockMutation.isError || deleteMutation.isError) && (
          <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            Thao tác thất bại, vui lòng thử lại
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="admin-TenDangNhap" className="block text-sm font-medium text-slate-700">
                Tên đăng nhập
              </label>
              <input
                id="admin-TenDangNhap"
                {...register('TenDangNhap')}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="admin-Email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="admin-Email"
                {...register('Email')}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="admin-HoTen" className="block text-sm font-medium text-slate-700">
              Họ và tên
            </label>
            <input
              id="admin-HoTen"
              {...register('HoTen')}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="admin-SoDienThoai" className="block text-sm font-medium text-slate-700">
                Số điện thoại
              </label>
              <input
                id="admin-SoDienThoai"
                {...register('SoDienThoai')}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="admin-NgaySinh" className="block text-sm font-medium text-slate-700">
                Ngày sinh
              </label>
              <input
                id="admin-NgaySinh"
                type="date"
                {...register('NgaySinh')}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="admin-GioiTinh" className="block text-sm font-medium text-slate-700">
              Giới tính
            </label>
            <select
              id="admin-GioiTinh"
              {...register('GioiTinh')}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Không chọn</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </form>

        <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
          {isLocked ? (
            <Button
              variant="secondary"
              onClick={() => unlockMutation.mutate(accountId)}
              disabled={unlockMutation.isPending}
            >
              {unlockMutation.isPending ? 'Đang mở khóa...' : 'Mở khóa tài khoản'}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => lockMutation.mutate(accountId)}
              disabled={lockMutation.isPending}
            >
              {lockMutation.isPending ? 'Đang khóa...' : 'Khóa tài khoản'}
            </Button>
          )}

          {!confirmDelete ? (
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Xóa tài khoản
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Xác nhận xóa?</span>
              <Button variant="danger" onClick={onDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Đang xóa...' : 'Xác nhận'}
              </Button>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                Hủy
              </Button>
            </div>
          )}
        </div>

        {deleteMutation.isSuccess && !deleteMutation.data?.hardDeleted && (
          <div role="status" className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Tài khoản có dữ liệu lịch sử liên quan nên đã được khóa thay vì xóa hoàn toàn.
          </div>
        )}
      </div>
    </div>
  );
}
