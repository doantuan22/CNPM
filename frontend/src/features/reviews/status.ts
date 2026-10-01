/** Badge color per TrangThai — mirrors backend/src/common/constants/review.ts REVIEW_STATUS. */
export const reviewStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'Hiển thị':
      return 'bg-success-light text-success-ink';
    case 'Chờ duyệt':
      return 'bg-warning-light text-warning-ink';
    case 'Ẩn':
      return 'bg-surface-tertiary text-ink-sub';
    case 'Vi phạm':
      return 'bg-danger-light text-danger-ink';
    default:
      return 'bg-surface-tertiary text-ink-sub';
  }
};
