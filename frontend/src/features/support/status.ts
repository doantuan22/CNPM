/** Badge color per TrangThai — mirrors backend/src/common/constants/support.ts SUPPORT_STATUS. */
export const supportStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'Mới':
      return 'bg-amber-50 text-amber-700';
    case 'Đang xử lý':
      return 'bg-blue-50 text-blue-700';
    case 'Đã xử lý':
      return 'bg-green-50 text-green-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};
