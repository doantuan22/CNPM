import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './Button';

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep details out of the UI; this remains available to observability/devtools.
    console.error('Unhandled UI error', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="mx-auto flex min-h-screen max-w-lg items-center px-4">
        <div role="alert" className="w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Đã xảy ra lỗi</h1>
          <p className="mt-2 text-sm text-slate-600">Trang không thể hiển thị. Vui lòng tải lại và thử lần nữa.</p>
          <Button className="mt-6" onClick={() => window.location.reload()}>Tải lại trang</Button>
        </div>
      </main>
    );
  }
}
