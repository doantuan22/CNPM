import type { ReactNode } from 'react';
import { Alert } from './Alert';

export function LoadingState({ label = 'Đang tải dữ liệu...' }: { label?: string }) {
  return <div className="ui-loading-state" role="status" aria-live="polite"><span className="spinner" aria-hidden="true" /><span>{label}</span></div>;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <section className="ui-empty-state" aria-labelledby="ui-empty-title"><h2 id="ui-empty-title">{title}</h2>{description && <p>{description}</p>}{action && <div>{action}</div>}</section>;
}

export function ErrorState({ title = 'Không thể tải dữ liệu', message, action }: { title?: string; message: string; action?: ReactNode }) {
  return <section className="ui-error-state"><Alert tone="error" title={title}>{message}</Alert>{action && <div className="ui-error-state__action">{action}</div>}</section>;
}

export function QueryState({ loading, error, empty, loadingLabel, emptyTitle, emptyDescription, children }: {
  loading: boolean;
  error?: unknown;
  empty?: boolean;
  loadingLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  children?: ReactNode;
}) {
  if (loading) return <LoadingState label={loadingLabel} />;
  if (error) return <ErrorState message={error instanceof Error ? error.message : 'Đã xảy ra lỗi. Vui lòng thử lại.'} />;
  if (empty) return <EmptyState title={emptyTitle ?? 'Chưa có dữ liệu'} description={emptyDescription} />;
  return <>{children}</>;
}
