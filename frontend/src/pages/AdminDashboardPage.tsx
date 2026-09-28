import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  return (
    <div className="admin-dashboard flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="type-page-title text-heading">Bảng điều khiển quản trị (Admin)</h1>
          <p className="text-sm text-slate-500 mt-0.5">Giám sát tổng thể hoạt động sàn, quản lý người dùng, đối tác và tác vụ chờ xử lý.</p>
        </div>
      </div>

      {/* KPI Style Cards for Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Analytics */}
        <Link to="/admin/analytics" className="bg-white p-5 rounded-[16px] border border-border shadow-sm flex items-center justify-between hover:border-primary transition-colors group">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Báo cáo & thống kê</span>
            <div className="text-[13px] text-slate-600 font-medium">Tài khoản, khách sạn, doanh thu</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center flex-none group-hover:bg-primary group-hover:text-white transition-colors">
            <i className="ph-fill ph-chart-bar text-[20px]"></i>
          </div>
        </Link>

        {/* Promotions */}
        <Link to="/admin/promotions" className="bg-white p-5 rounded-[16px] border border-border shadow-sm flex items-center justify-between hover:border-purple-500 transition-colors group">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Quản lý khuyến mãi</span>
            <div className="text-[13px] text-slate-600 font-medium">Tạo, cập nhật mã giảm giá</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-none group-hover:bg-purple-500 group-hover:text-white transition-colors">
            <i className="ph-fill ph-ticket text-[20px]"></i>
          </div>
        </Link>

        {/* Reviews */}
        <Link to="/admin/reviews" className="bg-white p-5 rounded-[16px] border border-border shadow-sm flex items-center justify-between hover:border-amber-500 transition-colors group">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Kiểm duyệt đánh giá</span>
            <div className="text-[13px] text-slate-600 font-medium">Duyệt, ẩn đánh giá vi phạm</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-none group-hover:bg-amber-500 group-hover:text-white transition-colors">
            <i className="ph-fill ph-star text-[20px]"></i>
          </div>
        </Link>

        {/* Support */}
        <Link to="/admin/support" className="bg-white p-5 rounded-[16px] border border-border shadow-sm flex items-center justify-between hover:border-cyan-500 transition-colors group">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Hỗ trợ & khiếu nại</span>
            <div className="text-[13px] text-slate-600 font-medium">Xử lý yêu cầu khách hàng</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center flex-none group-hover:bg-cyan-500 group-hover:text-white transition-colors">
            <i className="ph-fill ph-lifebuoy text-[20px]"></i>
          </div>
        </Link>

        {/* Partner Applications */}
        <Link to="/admin/partner-applications" className="bg-white p-5 rounded-[16px] border border-border shadow-sm flex items-center justify-between hover:border-indigo-500 transition-colors group">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Duyệt hồ sơ đối tác</span>
            <div className="text-[13px] text-slate-600 font-medium">Duyệt/Từ chối đăng ký KS</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-none group-hover:bg-indigo-500 group-hover:text-white transition-colors">
            <i className="ph-fill ph-storefront text-[20px]"></i>
          </div>
        </Link>

        {/* Accounts */}
        <Link to="/admin/accounts" className="bg-white p-5 rounded-[16px] border border-border shadow-sm flex items-center justify-between hover:border-emerald-500 transition-colors group">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Quản lý tài khoản</span>
            <div className="text-[13px] text-slate-600 font-medium">Quản trị người dùng hệ thống</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-none group-hover:bg-emerald-500 group-hover:text-white transition-colors">
            <i className="ph-fill ph-users text-[20px]"></i>
          </div>
        </Link>

        {/* Hotels */}
        <Link to="/admin/hotels" className="bg-white p-5 rounded-[16px] border border-border shadow-sm flex items-center justify-between hover:border-rose-500 transition-colors group">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Quản lý khách sạn</span>
            <div className="text-[13px] text-slate-600 font-medium">Cập nhật, đình chỉ hoạt động</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-none group-hover:bg-rose-500 group-hover:text-white transition-colors">
            <i className="ph-fill ph-buildings text-[20px]"></i>
          </div>
        </Link>

        {/* Payments */}
        <Link to="/admin/payments" className="bg-white p-5 rounded-[16px] border border-border shadow-sm flex items-center justify-between hover:border-orange-500 transition-colors group">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Theo dõi thanh toán</span>
            <div className="text-[13px] text-slate-600 font-medium">Giao dịch & hoàn tiền</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-none group-hover:bg-orange-500 group-hover:text-white transition-colors">
            <i className="ph-fill ph-credit-card text-[20px]"></i>
          </div>
        </Link>

      </div>

      <section className="admin-dashboard__note">
        <h2 className="text-lg font-semibold text-heading">Trung tâm kiểm soát quản trị viên</h2>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl">
          Quy trình phê duyệt hồ sơ đối tác đã được bật. Việc duyệt chỉ cấp vai trò Chủ khách sạn; đăng ký khách sạn thực hiện ở luồng riêng.
        </p>
      </section>

    </div>
  );
}
