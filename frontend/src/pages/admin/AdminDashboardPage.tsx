import { Link } from 'react-router-dom';
import { PageSpinner } from '../../components/common/PageSpinner';
import { useAdminAnalytics } from '../../features/analytics/hooks';
import { formatCurrencyVND } from '../../lib/utils';
import { ApiError } from '../../services/apiClient';

const reviewLinks = [
  { to: '/admin/partner-applications', title: 'Hồ sơ đối tác', detail: 'Đọc hồ sơ và xử lý đăng ký khách sạn' },
  { to: '/admin/hotels', title: 'Khách sạn', detail: 'Tìm kiếm, kiểm tra và quản lý cơ sở lưu trú' },
  { to: '/admin/reviews', title: 'Đánh giá', detail: 'Kiểm duyệt nội dung đánh giá' },
  { to: '/admin/support', title: 'Hỗ trợ & khiếu nại', detail: 'Theo dõi yêu cầu và trao đổi với khách hàng' },
  { to: '/admin/payments', title: 'Thanh toán', detail: 'Tra cứu giao dịch và trạng thái hoàn tiền' },
];

const platformLinks = [
  { to: '/admin/accounts', title: 'Tài khoản', detail: 'Quản lý người dùng hệ thống' },
  { to: '/admin/promotions', title: 'Khuyến mãi', detail: 'Tạo và cập nhật mã giảm giá' },
  { to: '/admin/analytics', title: 'Báo cáo & thống kê', detail: 'Đọc số liệu hoạt động nền tảng' },
];

function AdminLinkGroup({ title, links }: { title: string; links: typeof reviewLinks }) {
  return (
    <section className="admin-link-group" aria-labelledby={`admin-links-${title}`}>
      <h2 id={`admin-links-${title}`} className="text-base font-semibold text-heading">{title}</h2>
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to}>
              <span>
                <strong>{link.title}</strong>
                <small>{link.detail}</small>
              </span>
              <i className="ph ph-arrow-right" aria-hidden="true"></i>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function AdminDashboardPage() {
  // Use the existing audited aggregate endpoint. Detailed, date-filtered
  // analysis remains in /admin/analytics instead of inventing new metrics.
  const analyticsQuery = useAdminAnalytics({});
  const analytics = analyticsQuery.data;
  const activeHotels = analytics?.KhachSanTheoTrangThai.find((item) => item.Label === 'Hoạt động')?.SoLuong ?? 0;

  return (
    <div className="admin-dashboard flex flex-col gap-8 max-w-[1200px] mx-auto w-full">
      <header className="admin-dashboard__header">
        <h1 className="type-page-title text-heading">Quản trị nền tảng</h1>
        <p className="mt-1 text-sm text-muted">Tổng quan vận hành hiện tại và các nhóm công việc cần xử lý.</p>
      </header>

      {analyticsQuery.isLoading ? (
        <PageSpinner />
      ) : analyticsQuery.isError || !analytics ? (
        <div role="alert" className="rounded-lg border border-danger bg-danger-light px-4 py-3 text-sm text-danger">
          {analyticsQuery.error instanceof ApiError ? analyticsQuery.error.message : 'Không thể tải số liệu tổng quan'}
        </div>
      ) : (
        <section aria-label="Chỉ số tổng quan" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <article className="stat-card"><p className="stat-card__label">Tài khoản</p><strong className="stat-card__value">{analytics.TongTaiKhoan.toLocaleString('vi-VN')}</strong></article>
          <article className="stat-card"><p className="stat-card__label">Khách sạn hoạt động</p><strong className="stat-card__value">{activeHotels.toLocaleString('vi-VN')}</strong></article>
          <article className="stat-card"><p className="stat-card__label">Tổng đặt phòng</p><strong className="stat-card__value">{analytics.TongSoBooking.toLocaleString('vi-VN')}</strong></article>
          <article className="stat-card"><p className="stat-card__label">Doanh thu thực nhận</p><strong className="stat-card__value">{formatCurrencyVND(analytics.DoanhThuThucNhan)}</strong></article>
        </section>
      )}

      <div className="admin-dashboard__domains">
        <AdminLinkGroup title="Rà soát & hỗ trợ" links={reviewLinks} />
        <AdminLinkGroup title="Vận hành nền tảng" links={platformLinks} />
      </div>

      <section className="admin-dashboard__note" aria-labelledby="admin-governance-note">
        <h2 id="admin-governance-note" className="text-sm font-semibold text-heading">Quy trình đối tác</h2>
        <p className="mt-1 text-sm text-slate-600 max-w-2xl">
          Phê duyệt hồ sơ cấp vai trò Chủ khách sạn; đăng ký từng cơ sở lưu trú được thực hiện trong luồng riêng.
        </p>
      </section>
    </div>
  );
}
