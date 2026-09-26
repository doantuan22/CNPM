import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Hotel, CalendarCheck, User, LogIn, Menu, X, ShieldCheck, Building2, LogOut, LifeBuoy } from 'lucide-react';
import { useUiStore } from '../../lib/store';
import { useAuthStore } from '../../lib/authStore';
import { useLogout, useMe } from '../../features/auth/hooks';
import { ROLE_NAMES } from '../../lib/roles';
import { cn } from '../../lib/utils';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useUiStore();
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const meQuery = useMe();
  const logoutMutation = useLogout();

  const navLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/hotels', label: 'Khách sạn', icon: Hotel },
    { to: '/bookings', label: 'Đặt phòng', icon: CalendarCheck },
    { to: '/support', label: 'Hỗ trợ', icon: LifeBuoy },
  ];

  const authLinks = [
    { to: '/login', label: 'Đăng nhập', icon: LogIn },
    { to: '/register', label: 'Đăng ký', icon: User },
  ];

  const roleDashboard =
    role === ROLE_NAMES.ADMIN
      ? { to: '/admin', label: 'Quản trị', icon: ShieldCheck }
      : role === ROLE_NAMES.PARTNER
        ? { to: '/owner', label: 'Đối tác', icon: Building2 }
        : null;

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 tracking-tight">
          <Hotel className="h-6 w-6" />
          <span>StayHub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-blue-600',
                  isActive ? 'text-blue-600 font-semibold' : 'text-slate-600'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth Links */}
        <div className="hidden md:flex items-center gap-3">
          {accessToken ? (
            <>
              {roleDashboard && (
                <Link
                  to={roleDashboard.to}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <roleDashboard.icon className="h-4 w-4" />
                  <span>{roleDashboard.label}</span>
                </Link>
              )}
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <User className="h-4 w-4" />
                <span>{meQuery.data?.HoTen ?? 'Tài khoản'}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                <span>{logoutMutation.isPending ? 'Đang thoát...' : 'Đăng xuất'}</span>
              </button>
            </>
          ) : (
            authLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  link.to === '/register'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-slate-700 hover:bg-slate-100'
                )}
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            ))
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Toggle Menu"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isSidebarOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={toggleSidebar}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}
          {accessToken ? (
            <>
              {roleDashboard && (
                <Link
                  to={roleDashboard.to}
                  onClick={toggleSidebar}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                >
                  {roleDashboard.label}
                </Link>
              )}
              <Link
                to="/profile"
                onClick={toggleSidebar}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
              >
                Tài khoản
              </Link>
              <button
                type="button"
                onClick={() => {
                  toggleSidebar();
                  handleLogout();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            authLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={toggleSidebar}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
              >
                {link.label}
              </Link>
            ))
          )}
        </div>
      )}
    </header>
  );
}
