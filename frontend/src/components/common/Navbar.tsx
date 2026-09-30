import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUiStore } from '../../lib/store';
import { useAuthStore } from '../../lib/authStore';
import { useSignOut, useMe } from '../../features/auth/hooks';
import { ROLE_NAMES, profilePathFor } from '../../lib/roles';
import { cn } from '../../lib/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDrawerBehavior } from '../../hooks/useDrawerBehavior';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar, setSidebarOpen } = useUiStore();
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const meQuery = useMe();
  const { signOut, isPending: isSigningOut } = useSignOut();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  const closeDrawer = useCallback(() => setSidebarOpen(false), [setSidebarOpen]);
  useDrawerBehavior({ open: isSidebarOpen, onClose: closeDrawer, containerRef: drawerRef });

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
    await signOut();
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
                    <div className="site-header__avatar site-header__avatar--initial">
                      {meQuery.data?.HoTen?.charAt(0) ?? 'U'}
                    </div>
                    <span className="site-header__user-name">
                      {meQuery.data?.HoTen ?? 'Tài khoản'}
                    </span>
                    <i className="ph ph-caret-down site-header__user-caret"></i>
                  </button>
                  <div className={cn("dropdown-menu", isDropdownOpen && "open")}>
                    {roleDashboard && (
                      <Link to={roleDashboard.to} className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                        <i className="ph ph-squares-four text-lg"></i> {roleDashboard.label}
                      </Link>
                    )}
                    <Link to={profilePathFor(role)} className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <i className="ph ph-user text-lg"></i> Tài khoản của tôi
                    </Link>
                    {role === ROLE_NAMES.CUSTOMER && (
                      <Link to="/bookings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                        <i className="ph ph-calendar-check text-lg"></i> Đơn đặt phòng
                      </Link>
                    )}
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item danger" 
                      onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                      disabled={isSigningOut}
                    >
                      <i className="ph ph-sign-out text-lg"></i> {isSigningOut ? 'Đang thoát...' : 'Đăng xuất'}
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
                className={cn('mobile-drawer__link', location.pathname === link.to && 'is-active')}
              >
                {link.label}
              </Link>
            ))}
            {accessToken && <>
              {roleDashboard && <Link to={roleDashboard.to} onClick={toggleSidebar} className="mobile-drawer__link">{roleDashboard.label}</Link>}
              <Link to={profilePathFor(role)} onClick={toggleSidebar} className="mobile-drawer__link">Tài khoản của tôi</Link>
              {role === ROLE_NAMES.CUSTOMER && <Link to="/bookings" onClick={toggleSidebar} className="mobile-drawer__link">Đơn đặt phòng</Link>}
            </>}
            {!accessToken && (
              <>
                <div className="dropdown-divider my-4"></div>
                <Link to="/login" onClick={toggleSidebar} className="mobile-drawer__link">Đăng nhập</Link>
                <Link to="/register" onClick={toggleSidebar} className="mobile-drawer__link is-active">Đăng ký</Link>
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
