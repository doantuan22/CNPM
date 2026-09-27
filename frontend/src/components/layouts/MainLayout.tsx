import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { NavigationEffects } from '../common/NavigationEffects';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <a href="#main-content" className="sr-only z-50 rounded bg-white px-4 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Chuyển đến nội dung chính
      </a>
      <NavigationEffects />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 focus:outline-none">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        <div className="mx-auto max-w-7xl px-4">
          <p>© 2026 Nền tảng đặt phòng khách sạn trực tuyến (StayHub). TECH-0 Foundation.</p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
