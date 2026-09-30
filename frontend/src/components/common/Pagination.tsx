const buttonClass =
  'px-3 py-1.5 rounded-lg border border-border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-xs font-medium transition';

/** Footer of a paged list: "Trang 2 / 5 — Tổng 47 tài khoản" with previous / next buttons. */
export function Pagination({ page, totalPages, total, itemLabel, onPageChange }: {
  page: number;
  totalPages: number;
  total: number;
  /** What is being counted, e.g. "tài khoản". */
  itemLabel: string;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav aria-label="Phân trang" className="px-6 py-4 border-t border-border bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-xs text-slate-500">
        Trang <strong className="text-heading">{page}</strong> / {totalPages} — Tổng <strong className="text-heading">{total}</strong> {itemLabel}
      </div>
      <div className="flex gap-1.5">
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className={buttonClass}>Trước</button>
        <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className={buttonClass}>Sau</button>
      </div>
    </nav>
  );
}
