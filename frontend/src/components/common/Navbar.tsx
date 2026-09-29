import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUiStore } from '../../lib/store';
import { useAuthStore } from '../../lib/authStore';
import { useLogout, useMe } from '../../features/auth/hooks';
import { ROLE_NAMES } from '../../lib/roles';
import { cn } from '../../lib/utils';
import { useEffect, useRef, useState } from 'react';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useUiStore();
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const meQuery = useMe();
  const logoutMutation = useLogout();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const drawerTriggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])') ?? [];
    requestAnimationFrame(() => focusable()[0]?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        toggleSidebar();
        drawerTriggerRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = [...focusable()];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen, toggleSidebar]);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        menuTriggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isDropdownOpen]);

  const navLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/hotels', label: 'Khách sạn' },
    { to: '/support', label: 'Hỗ trợ' },
  ];

  const roleDashboard =
    role === ROLE_NAMES.ADMIN
      ? { to: '/admin', label: 'Quản trị' }
      : role === ROLE_NAMES.PARTNER
        ? { to: '/owner', label: 'Đối tác' }
        : null;

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate('/', { replace: true });
  };

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/" className="site-header__logo">
            <div className="site-header__logo-mark">E</div>Egode
          </Link>
          
          <nav className="site-header__nav">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(location.pathname === link.to && 'active')}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="site-header__actions">
            {accessToken ? (
              <>
                <div className="dropdown">
                  <button
                    ref={menuTriggerRef}
                    className="site-header__user" 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="menu"
                  >
                    <div className="site-header__avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                      {meQuery.data?.HoTen?.charAt(0) ?? 'U'}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-heading)' }}>
                      {meQuery.data?.HoTen ?? 'Tài khoản'}
                    </span>
                    <i className="ph ph-caret-down" style={{ fontSize: '13px', color: 'var(--color-muted)' }}></i>
                  </button>
                  <div className={cn("dropdown-menu", isDropdownOpen && "open")}>
                    {roleDashboard && (
                      <Link to={roleDashboard.to} className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                        <i className="ph ph-squares-four text-lg"></i> {roleDashboard.label}
                      </Link>
                    )}
                    <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <i className="ph ph-user text-lg"></i> Tài khoản của tôi
                    </Link>
                    <Link to="/bookings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <i className="ph ph-calendar-check text-lg"></i> Đơn đặt phòng
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item danger" 
                      onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                      disabled={logoutMutation.isPending}
                    >
                      <i className="ph ph-sign-out text-lg"></i> {logoutMutation.isPending ? 'Đang thoát...' : 'Đăng xuất'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">Đăng nhập</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
              </>
            )}
            
            <button
              ref={drawerTriggerRef}
              className="site-header__icon-btn site-header__menu-toggle"
              onClick={toggleSidebar}
              aria-label="Mở menu"
              aria-expanded={isSidebarOpen}
              aria-controls="public-mobile-navigation"
              aria-haspopup="dialog"
            >
              <i className="ph ph-list"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={cn("mobile-drawer", isSidebarOpen && "open")}>
        <button type="button" className="mobile-drawer__backdrop" aria-label="Đóng menu" tabIndex={isSidebarOpen ? 0 : -1} onClick={toggleSidebar}></button>
        <aside id="public-mobile-navigation" ref={drawerRef} className="mobile-drawer__panel" role="dialog" aria-modal="true" aria-label="Điều hướng chính" aria-hidden={!isSidebarOpen} inert={!isSidebarOpen}>
          <div className="flex justify-end mb-4">
            <button type="button" onClick={toggleSidebar} className="btn-icon btn-ghost" aria-label="Đóng menu"><i className="ph ph-x text-2xl" aria-hidden="true"></i></button>
          </div>
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={toggleSidebar}
                style={{ display: 'block', padding: '12px 14px', borderRadius: 'var(--radius-md)', fontWeight: 600, color: location.pathname === link.to ? 'var(--color-primary)' : 'var(--color-heading)' }}
              >
                {link.label}
              </Link>
            ))}
            {accessToken && <>
              {roleDashboard && <Link to={roleDashboard.to} onClick={toggleSidebar} className="mobile-drawer__link">{roleDashboard.label}</Link>}
              <Link to="/profile" onClick={toggleSidebar} className="mobile-drawer__link">Tài khoản của tôi</Link>
              <Link to="/bookings" onClick={toggleSidebar} className="mobile-drawer__link">Đơn đặt phòng</Link>
            </>}
            {!accessToken && (
              <>
                <div className="dropdown-divider my-4"></div>
                <Link to="/login" onClick={toggleSidebar} style={{ display: 'block', padding: '12px 14px', fontWeight: 600 }}>Đăng nhập</Link>
                <Link to="/register" onClick={toggleSidebar} style={{ display: 'block', padding: '12px 14px', fontWeight: 600, color: 'var(--color-primary)' }}>Đăng ký</Link>
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
