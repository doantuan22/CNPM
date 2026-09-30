import { Outlet, useLocation, Link } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { NavigationEffects } from '../common/NavigationEffects';
import { AppErrorBoundary } from '../common/AppErrorBoundary';
import { DashboardNavigation, DashboardTopbar } from './DashboardNavigation';
import { useAuthStore } from '../../lib/authStore';
import { ROLE_NAMES } from '../../lib/roles';

export function MainLayout() {
  const location = useLocation();
  const role = useAuthStore((state) => state.role);
  const isDashboard =
    (role === ROLE_NAMES.ADMIN && location.pathname.startsWith('/admin')) ||
    (role === ROLE_NAMES.PARTNER && (location.pathname.startsWith('/owner') || location.pathname.startsWith('/partner')));

  return (
    <div className={isDashboard ? 'dashboard-shell' : ''}>
      <a href="#main-content" className="sr-only z-50 rounded bg-white px-4 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Chuyển đến nội dung chính</a>
      <NavigationEffects />
      
      {isDashboard && role ? (
        <>
          <DashboardNavigation role={role} />
          <div className="dashboard-main">
            <DashboardTopbar role={role} />
            <main id="main-content" tabIndex={-1} className="dashboard-content focus:outline-none">
              <AppErrorBoundary inline resetKey={location.pathname}><Outlet /></AppErrorBoundary>
            </main>
          </div>
        </>
      ) : (
        <>
          <Navbar />
          <main id="main-content" tabIndex={-1} className="focus:outline-none min-h-[60vh]">
            <AppErrorBoundary inline resetKey={location.pathname}><Outlet /></AppErrorBoundary>
          </main>
          <footer className="site-footer">
            <div className="site-footer__inner">
              <div className="site-footer__grid">
                <div className="site-footer__col">
                  <div className="site-footer__brand mb-4">
                    <div className="site-header__logo-mark" style={{ width: '38px', height: '38px' }}>E</div>Egode
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.6 }}>Tìm nơi lưu trú, theo dõi chuyến đi và quản lý cơ sở trên Egode.</p>
                </div>
                <div className="site-footer__col">
                  <h4>Hỗ trợ</h4>
                  <Link to="/support">Trung tâm trợ giúp</Link>
                </div>
                <div className="site-footer__col">
                  <h4>Đối tác</h4>
                  <Link to="/partner/apply">Đăng ký chỗ nghỉ</Link>
                  <Link to="/login">Đăng nhập Partner</Link>
                </div>
              </div>
              <div className="site-footer__bottom">
                <p>&copy; {new Date().getFullYear()} Egode. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default MainLayout;
