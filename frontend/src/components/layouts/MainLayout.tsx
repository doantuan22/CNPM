import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
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
