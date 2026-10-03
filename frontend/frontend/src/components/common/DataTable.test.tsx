import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataTable, type Column } from './DataTable';

interface Row { id: number; name: string }
const columns: Column<Row>[] = [
  { key: 'id', header: 'Mã', cell: (r) => r.id },
  { key: 'name', header: 'Tên', align: 'right', cell: (r) => r.name },
];
const props = { columns, getRowKey: (r: Row) => r.id, caption: 'Danh sách thử' };

describe('DataTable', () => {
  it('renders a captioned table with a header cell per column and a row per item', () => {
    render(<DataTable {...props} rows={[{ id: 1, name: 'An' }, { id: 2, name: 'Bình' }]} />);

    const table = screen.getByRole('table', { name: 'Danh sách thử' });
    expect(within(table).getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Mã', 'Tên']);
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    expect(within(table).getByText('Bình')).toHaveClass('text-right');
  });

  it('shows a busy placeholder instead of the table while loading', () => {
    render(<DataTable {...props} rows={undefined} isLoading />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows the error as an alert, and the error wins over stale rows', () => {
    render(<DataTable {...props} rows={[{ id: 1, name: 'An' }]} error="Không tải được" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Không tải được');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows the empty state with its own wording', () => {
    render(<DataTable {...props} rows={[]} emptyTitle="Không có gì" emptyDescription="Thử bộ lọc khác" />);

    expect(screen.getByText('Không có gì')).toBeInTheDocument();
    expect(screen.getByText('Thử bộ lọc khác')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders the footer under the table, and under the empty state too', () => {
    const { rerender } = render(<DataTable {...props} rows={[{ id: 1, name: 'An' }]} footer={<nav aria-label="Phân trang" />} />);
    expect(screen.getByRole('navigation', { name: 'Phân trang' })).toBeInTheDocument();

    rerender(<DataTable {...props} rows={[]} footer={<nav aria-label="Phân trang" />} />);
    expect(screen.getByRole('navigation', { name: 'Phân trang' })).toBeInTheDocument();
  });
});
