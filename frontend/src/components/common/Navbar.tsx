import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUiStore } from '../../lib/store';
import { useAuthStore } from '../../lib/authStore';
import { useLogout, useMe } from '../../features/auth/hooks';
import { ROLE_NAMES } from '../../lib/roles';
import { cn } from '../../lib/utils';
import { useState } from 'react';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useUiStore();
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const meQuery = useMe();
  const logoutMutation = useLogout();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
                <button className="site-header__icon-btn" aria-label="Thông báo">
                  <i className="ph ph-bell"></i>
                  <span className="dot"></span>
                </button>
                <div className="dropdown">
                  <button 
                    className="site-header__user" 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-expanded={isDropdownOpen}
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
              className="site-header__icon-btn site-header__menu-toggle"
              onClick={toggleSidebar}
              aria-label="Mở menu"
            >
              <i className="ph ph-list"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={cn("mobile-drawer", isSidebarOpen && "open")}>
        <div className="mobile-drawer__backdrop" onClick={toggleSidebar}></div>
        <div className="mobile-drawer__panel">
          <div className="flex justify-end mb-4">
            <button onClick={toggleSidebar} className="btn-icon btn-ghost"><i className="ph ph-x text-2xl"></i></button>
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
            {!accessToken && (
              <>
                <div className="dropdown-divider my-4"></div>
                <Link to="/login" onClick={toggleSidebar} style={{ display: 'block', padding: '12px 14px', fontWeight: 600 }}>Đăng nhập</Link>
                <Link to="/register" onClick={toggleSidebar} style={{ display: 'block', padding: '12px 14px', fontWeight: 600, color: 'var(--color-primary)' }}>Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
