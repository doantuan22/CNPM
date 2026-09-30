import { Building2, CalendarCheck, ChevronDown, CreditCard, FileText, Hotel, LayoutDashboard, LogOut, Menu, MessageSquare, Percent, Star, UserRound, Users, BarChart3 } from 'lucide-react';
import { useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUiStore } from '../../lib/store';
import { useSignOut, useMe } from '../../features/auth/hooks';
import { ROLE_NAMES } from '../../lib/roles';
import { cn } from '../../lib/utils';
import { useDrawerBehavior } from '../../hooks/useDrawerBehavior';
import { useMediaQuery } from '../../hooks/useMediaQuery';

type DashboardRole = typeof ROLE_NAMES.ADMIN | typeof ROLE_NAMES.PARTNER;

const ownerGroups = [
  { title: 'Quản lý khách sạn', items: [
    { to: '/owner/overview', label: 'Tổng quan', icon: LayoutDashboard },
    { to: '/owner/hotels', label: 'Khách sạn của tôi', icon: Building2 },
    { to: '/owner/room-types', label: 'Loại phòng', icon: Hotel },
    { to: '/owner/inventory-pricing', label: 'Quỹ phòng & giá bán', icon: CalendarCheck },
    { to: '/owner/bookings', label: 'Đặt phòng', icon: FileText },
  ]},
  { title: 'Kinh doanh & báo cáo', items: [
    { to: '/owner/revenue', label: 'Doanh thu', icon: CreditCard },
    { to: '/owner/reports', label: 'Báo cáo thống kê', icon: BarChart3 },
    { to: '/owner/profile', label: 'Hồ sơ cá nhân', icon: UserRound },
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
  if (to === '/owner/overview') return pathname === to;
  if (to === '/owner/hotels') return pathname === to || pathname === '/owner/hotels/new' || /^\/owner\/hotels\/\d+$/.test(pathname);
  if (to === '/owner/room-types') return pathname === to || pathname.startsWith('/owner/room-types/');
  if (to === '/owner/bookings') return pathname === to || pathname.startsWith('/owner/bookings/');
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function DashboardNavigation({ role }: { role: DashboardRole }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarOpen, setSidebarOpen } = useUiStore();
  const { signOut, isPending: isSigningOut } = useSignOut();
  const groups = role === ROLE_NAMES.ADMIN ? adminGroups : ownerGroups;
  const label = role === ROLE_NAMES.ADMIN ? 'Quản trị' : 'Chủ khách sạn';

  const logout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };
  const closeSidebar = useCallback(() => setSidebarOpen(false), [setSidebarOpen]);
  // Below this width (same breakpoint as layout.css) the sidebar is an off-canvas drawer, above it a permanent landmark.
  const isOffCanvas = useMediaQuery('(max-width: 1180px)');
  const sidebarRef = useRef<HTMLElement>(null);
  useDrawerBehavior({ open: isSidebarOpen, onClose: closeSidebar, containerRef: sidebarRef, enabled: isOffCanvas });
  const drawerOpen = isOffCanvas && isSidebarOpen;
  const selectedHotelId = new URLSearchParams(location.search).get('hotelId')
    ?? location.pathname.match(/^\/owner\/hotels\/(\d+)/)?.[1]
    ?? location.pathname.match(/^\/partner\/hotels\/(\d+)/)?.[1];
  const destinationFor = (to: string) => {
    if (role !== ROLE_NAMES.PARTNER || !selectedHotelId || !['/owner/room-types', '/owner/inventory-pricing', '/owner/bookings', '/owner/revenue', '/owner/reports'].includes(to)) return to;
    return `${to}?hotelId=${encodeURIComponent(selectedHotelId)}`;
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn('dashboard-sidebar', isSidebarOpen && 'open')}
        aria-label={`Điều hướng ${label}`}
        role={drawerOpen ? 'dialog' : undefined}
        aria-modal={drawerOpen ? true : undefined}
        inert={isOffCanvas && !isSidebarOpen}
      >
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
                return <Link key={`${item.to}-${item.label}`} to={destinationFor(item.to)} onClick={closeSidebar} className={cn('dashboard-sidebar__item', active && 'active')} aria-current={active ? 'page' : undefined}><Icon className="h-[18px] w-[18px]" /><span>{item.label}</span></Link>;
              })}
            </div>
          ))}
        </nav>
        <div className="dashboard-sidebar__footer">
          <button type="button" className="dashboard-sidebar__item text-red-600 hover:bg-red-50" onClick={logout} disabled={isSigningOut}><LogOut className="h-[18px] w-[18px]" /><span>{isSigningOut ? 'Đang thoát...' : 'Đăng xuất'}</span></button>
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
  const profilePath = role === ROLE_NAMES.PARTNER ? '/owner/profile' : '/profile';
  return <header className="dashboard-topbar"><button type="button" className="dashboard-sidebar-toggle btn btn-icon btn-ghost" onClick={toggleSidebar} aria-label="Mở menu"><Menu className="h-5 w-5" /></button><div className="dashboard-topbar__actions"><Link to={profilePath} className="site-header__user"><span className="site-header__avatar dashboard-user-avatar">{name.charAt(0).toUpperCase()}</span><span className="dashboard-user-meta hidden text-left sm:block"><strong>{name}</strong><small>{role === ROLE_NAMES.ADMIN ? 'Quản trị viên' : 'Chủ khách sạn'}</small></span><ChevronDown className="h-4 w-4 text-slate-400" /></Link></div></header>;
}
