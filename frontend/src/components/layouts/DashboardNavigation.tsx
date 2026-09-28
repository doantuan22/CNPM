import { Bell, Building2, CalendarCheck, ChevronDown, CreditCard, FileText, Hotel, LayoutDashboard, LogOut, Menu, MessageSquare, Percent, Star, UserRound, Users, BarChart3 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUiStore } from '../../lib/store';
import { useLogout, useMe } from '../../features/auth/hooks';
import { ROLE_NAMES } from '../../lib/roles';
import { cn } from '../../lib/utils';

type DashboardRole = typeof ROLE_NAMES.ADMIN | typeof ROLE_NAMES.PARTNER;

const ownerGroups = [
  { title: 'Quản lý khách sạn', items: [
    { to: '/partner/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { to: '/partner/hotels', label: 'Khách sạn của tôi', icon: Building2 },
    { to: '/partner/room-types', label: 'Loại phòng', icon: Hotel },
    { to: '/partner/inventory-pricing', label: 'Quỹ phòng & giá bán', icon: CalendarCheck },
    { to: '/partner/bookings', label: 'Đặt phòng', icon: FileText },
  ]},
  { title: 'Kinh doanh & báo cáo', items: [
    { to: '/partner/revenue', label: 'Doanh thu', icon: BarChart3 },
    { to: '/partner/reports', label: 'Báo cáo thống kê', icon: BarChart3 },
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
  if (to === '/admin') return pathname === to;
  if (to === '/partner/dashboard') return pathname === to;
  if (to === '/partner/hotels') return pathname === '/owner' || pathname === to || pathname.startsWith('/owner/hotels/') || pathname.startsWith('/partner/hotels/');
  if (to === '/partner/room-types') return pathname.startsWith('/partner/room-types') || pathname.startsWith('/owner/room-types/') || pathname.endsWith('/room-types');
  if (to === '/partner/bookings') return pathname === to || /\/(owner|partner)\/hotels\/[^/]+\/bookings(?:\/|$)/.test(pathname);
  if (to === '/partner/reports') return pathname === to || /\/owner\/hotels\/[^/]+\/analytics$/.test(pathname);
  if (to === '/partner/revenue') return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function DashboardNavigation({ role }: { role: DashboardRole }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarOpen, setSidebarOpen } = useUiStore();
  const logoutMutation = useLogout();
  const groups = role === ROLE_NAMES.ADMIN ? adminGroups : ownerGroups;
  const label = role === ROLE_NAMES.ADMIN ? 'Quản trị' : 'Đối tác';

  const logout = async () => {
    await logoutMutation.mutateAsync();
    navigate('/login', { replace: true });
  };
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <aside className={cn('dashboard-sidebar', isSidebarOpen && 'open')} aria-label={`Điều hướng ${label}`}>
        <div className="dashboard-sidebar__brand">
          <Link to="/" className="site-header__logo" onClick={closeSidebar}>
            <span className="site-header__logo-mark">E</span>
            <span>Egode</span>
          </Link>
          <span className="badge badge-primary">{label}</span>
        </div>
        <nav className="dashboard-sidebar__nav">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="dashboard-sidebar__group-title">{group.title}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activePath(location.pathname, item.to);
                return <Link key={`${item.to}-${item.label}`} to={item.to} onClick={closeSidebar} className={cn('dashboard-sidebar__item', active && 'active')} aria-current={active ? 'page' : undefined}><Icon className="h-[18px] w-[18px]" /><span>{item.label}</span></Link>;
              })}
            </div>
          ))}
        </nav>
        <div className="dashboard-sidebar__footer">
          <button type="button" className="dashboard-sidebar__item text-red-600 hover:bg-red-50" onClick={logout} disabled={logoutMutation.isPending}><LogOut className="h-[18px] w-[18px]" /><span>{logoutMutation.isPending ? 'Đang thoát...' : 'Đăng xuất'}</span></button>
        </div>
      </aside>
      {isSidebarOpen && <button type="button" aria-label="Đóng menu" className="sidebar-scrim open" onClick={closeSidebar} />}
    </>
  );
}

export function DashboardTopbar({ role }: { role: DashboardRole }) {
  const { toggleSidebar } = useUiStore();
  const meQuery = useMe();
  const name = meQuery.data?.HoTen ?? (role === ROLE_NAMES.ADMIN ? 'Quản trị viên' : 'Đối tác');
  return <header className="dashboard-topbar"><button type="button" className="dashboard-sidebar-toggle btn btn-icon btn-ghost" onClick={toggleSidebar} aria-label="Mở menu"><Menu className="h-5 w-5" /></button><div className="dashboard-topbar__search"><span aria-hidden="true">⌕</span><input aria-label="Tìm kiếm" placeholder="Tìm kiếm..." /></div><div className="dashboard-topbar__actions"><button type="button" className="site-header__icon-btn" aria-label="Thông báo"><Bell className="h-[18px] w-[18px]" /><span className="dot" /></button><Link to="/profile" className="site-header__user"><span className="site-header__avatar dashboard-user-avatar">{name.charAt(0).toUpperCase()}</span><span className="dashboard-user-meta hidden text-left sm:block"><strong>{name}</strong><small>{role === ROLE_NAMES.ADMIN ? 'Quản trị viên' : 'Chủ khách sạn'}</small></span><ChevronDown className="h-4 w-4 text-slate-400" /></Link></div></header>;
}
