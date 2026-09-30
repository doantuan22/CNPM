import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  /**
   * Per-page boundary rendered inside a layout: the layout (navbar, sidebar) stays usable and no
   * extra <main> landmark is added. Without it this is the last-resort, full-screen boundary.
   */
  inline?: boolean;
  /** When this value changes (e.g. the pathname) a shown error is cleared, so navigating away recovers. */
  resetKey?: string;
}
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

  componentDidUpdate(previous: Props) {
    if (this.state.hasError && previous.resetKey !== this.props.resetKey) this.setState({ hasError: false });
  }

  private reset = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.inline) {
      return (
        <div className="page-container py-16">
          <div role="alert" className="mx-auto w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">Đã xảy ra lỗi</h1>
            <p className="mt-2 text-sm text-slate-600">Trang này không thể hiển thị. Bạn có thể thử lại hoặc quay về trang chủ.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={this.reset}>Thử lại</Button>
              <Button variant="outline" asChild><Link to="/">Về trang chủ</Link></Button>
            </div>
          </div>
        </div>
      );
    }

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
