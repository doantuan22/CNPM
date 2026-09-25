import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md text-center py-16 space-y-4">
      <h1 className="text-7xl font-extrabold text-blue-600">404</h1>
      <h2 className="text-2xl font-bold text-slate-900">Không tìm thấy trang</h2>
      <p className="text-sm text-slate-500">
        Đường dẫn bạn yêu cầu không tồn tại hoặc đã được di chuyển.
      </p>
      <div className="pt-4">
        <Button asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" /> Về trang chủ
          </Link>
        </Button>
      </div>
    </div>
  );
}
