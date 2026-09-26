/** Badge color per TrangThai — mirrors backend/src/common/constants/commercial.ts PROMOTION_STATUS. */
export const promotionStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'Hoạt động':
      return 'bg-green-50 text-green-700';
    case 'Ngừng':
      return 'bg-slate-100 text-slate-600';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};
