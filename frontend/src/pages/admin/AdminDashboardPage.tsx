import { Link } from 'react-router-dom';

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
  return (
    <div className="admin-dashboard flex flex-col gap-8 max-w-[1200px] mx-auto w-full">
      <header className="admin-dashboard__header">
        <h1 className="type-page-title text-heading">Quản trị nền tảng</h1>
        <p className="mt-1 text-sm text-slate-600">Chọn nhóm công việc để kiểm tra, xử lý hoặc theo dõi hoạt động Egode.</p>
      </header>

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
