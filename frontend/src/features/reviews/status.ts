/** Badge color per TrangThai — mirrors backend/src/common/constants/review.ts REVIEW_STATUS. */
export const reviewStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'Hiển thị':
      return 'bg-green-50 text-green-700';
    case 'Chờ duyệt':
      return 'bg-amber-50 text-amber-700';
    case 'Ẩn':
      return 'bg-slate-100 text-slate-600';
    case 'Vi phạm':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};
