import { Bell, Building2, CalendarCheck, ChevronDown, CreditCard, FileText, Hotel, LayoutDashboard, LogOut, Menu, MessageSquare, Percent, Star, UserRound, Users, BarChart3 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUiStore } from '../../lib/store';
import { useLogout, useMe } from '../../features/auth/hooks';
import { ROLE_NAMES } from '../../lib/roles';
import { cn } from '../../lib/utils';

type DashboardRole = typeof ROLE_NAMES.ADMIN | typeof ROLE_NAMES.PARTNER;

const ownerGroups = [
  { title: 'Quản lý khách sạn', items: [
    { to: '/owner', label: 'Tổng quan', icon: LayoutDashboard },
    { to: '/owner', label: 'Khách sạn của tôi', icon: Building2 },
    { to: '/owner', label: 'Loại phòng', icon: Hotel },
    { to: '/owner', label: 'Quỹ phòng & giá bán', icon: CalendarCheck },
    { to: '/owner', label: 'Đặt phòng', icon: FileText },
  ]},
  { title: 'Kinh doanh & báo cáo', items: [
    { to: '/owner', label: 'Doanh thu', icon: BarChart3 },
    { to: '/owner', label: 'Báo cáo thống kê', icon: BarChart3 },
    { to: '/profile', label: 'Hồ sơ cá nhân', icon: UserRound },
  ]},
];

const adminGroups = [
  { title: 'Điều hành nền tảng', items: [
    { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
    { to: '/admin/accounts', label: 'Tài khoản', icon: Users },
    { to: '/admin/partner-applications', label: 'Hồ sơ đăng ký', icon: FileText },
    { to: '/admin/hotels', label: 'Khách sạn', icon: Building2 },
  ]},
  { title: 'Vận hành sàn', items: [
    { to: '/admin/payments', label: 'Thanh toán & giao dịch', icon: CreditCard },
    { to: '/admin/reviews', label: 'Đánh giá', icon: Star },
    { to: '/admin/support', label: 'Hỗ trợ & khiếu nại', icon: MessageSquare },
    { to: '/admin/promotions', label: 'Khuyến mãi', icon: Percent },
    { to: '/admin/analytics', label: 'Thống kê', icon: BarChart3 },
  ]},
];

function activePath(pathname: string, to: string) {
  if (to === '/owner' || to === '/admin') return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function DashboardNavigation({ role }: { role: DashboardRole }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useUiStore();
  const logoutMutation = useLogout();
  const groups = role === ROLE_NAMES.ADMIN ? adminGroups : ownerGroups;
  const label = role === ROLE_NAMES.ADMIN ? 'Quản trị' : 'Đối tác';

  const logout = async () => {
    await logoutMutation.mutateAsync();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <aside className={cn('egode-dashboard-sidebar', isSidebarOpen && 'is-open')} aria-label={`Điều hướng ${label}`}>
        <div className="egode-dashboard-brand">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-slate-900" onClick={toggleSidebar}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-extrabold text-white">E</span>
            <span>StayHub</span>
          </Link>
          <span className="egode-role-badge">{label}</span>
        </div>
        <nav className="egode-dashboard-nav">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="egode-dashboard-group-title">{group.title}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activePath(location.pathname, item.to);
                return <Link key={`${item.to}-${item.label}`} to={item.to} onClick={toggleSidebar} className={cn('egode-dashboard-item', active && 'is-active')} aria-current={active ? 'page' : undefined}><Icon className="h-[18px] w-[18px]" /><span>{item.label}</span></Link>;
              })}
            </div>
          ))}
        </nav>
        <div className="egode-dashboard-footer">
          <button type="button" className="egode-dashboard-item text-red-600 hover:bg-red-50" onClick={logout} disabled={logoutMutation.isPending}><LogOut className="h-[18px] w-[18px]" /><span>{logoutMutation.isPending ? 'Đang thoát...' : 'Đăng xuất'}</span></button>
        </div>
      </aside>
      {isSidebarOpen && <button type="button" aria-label="Đóng menu" className="egode-dashboard-scrim" onClick={toggleSidebar} />}
    </>
  );
}

export function DashboardTopbar({ role }: { role: DashboardRole }) {
  const { toggleSidebar } = useUiStore();
  const meQuery = useMe();
  const name = meQuery.data?.HoTen ?? (role === ROLE_NAMES.ADMIN ? 'Quản trị viên' : 'Đối tác');
  return <header className="egode-dashboard-topbar"><button type="button" className="egode-dashboard-menu" onClick={toggleSidebar} aria-label="Mở menu"><Menu className="h-5 w-5" /></button><div className="egode-dashboard-search"><span aria-hidden="true">⌕</span><input aria-label="Tìm kiếm" placeholder="Tìm kiếm..." /></div><div className="egode-dashboard-actions"><button type="button" className="egode-icon-button" aria-label="Thông báo"><Bell className="h-[18px] w-[18px]" /><i /></button><Link to="/profile" className="egode-user-chip"><span className="egode-avatar">{name.charAt(0).toUpperCase()}</span><span className="hidden text-left sm:block"><strong>{name}</strong><small>{role === ROLE_NAMES.ADMIN ? 'Quản trị viên' : 'Chủ khách sạn'}</small></span><ChevronDown className="h-4 w-4 text-slate-400" /></Link></div></header>;
}
