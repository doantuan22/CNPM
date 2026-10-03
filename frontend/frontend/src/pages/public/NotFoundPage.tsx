import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md text-center py-16 space-y-4">
      <h1 className="text-7xl font-extrabold text-primary">404</h1>
      <h2 className="text-2xl font-bold text-ink">Không tìm thấy trang</h2>
      <p className="text-sm text-ink-muted">
        Đường dẫn bạn yêu cầu không tồn tại hoặc đã được di chuyển.
      </p>
      <div className="pt-4">
        <Button asChild>
          <Link to="/">
            <Icon name="house" size={16} className="mr-2" /> Về trang chủ
          </Link>
        </Button>
      </div>
    </div>
  );
}
