import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('says where the user is and how many items there are', () => {
    render(<Pagination page={2} totalPages={5} total={47} itemLabel="tài khoản" onPageChange={() => undefined} />);

    const summary = screen.getByText(/Trang/);
    expect(summary).toHaveTextContent('Trang 2 / 5 — Tổng 47 tài khoản');
  });

  it('is a labelled navigation landmark', () => {
    render(<Pagination page={1} totalPages={3} total={30} itemLabel="khách sạn" onPageChange={() => undefined} />);
    expect(screen.getByRole('navigation', { name: 'Phân trang' })).toBeInTheDocument();
  });

  it('goes to the previous and next page', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination page={3} totalPages={5} total={50} itemLabel="giao dịch" onPageChange={onPageChange} />);

    await user.click(screen.getByRole('button', { name: 'Trước' }));
    await user.click(screen.getByRole('button', { name: 'Sau' }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 2);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 4);
  });

  it('cannot go before the first or after the last page', () => {
    const { rerender } = render(<Pagination page={1} totalPages={5} total={50} itemLabel="x" onPageChange={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Trước' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sau' })).toBeEnabled();

    rerender(<Pagination page={5} totalPages={5} total={50} itemLabel="x" onPageChange={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Sau' })).toBeDisabled();
  });

  it('a single page has nothing to page through', () => {
    render(<Pagination page={1} totalPages={1} total={4} itemLabel="đánh giá" onPageChange={() => undefined} />);

    expect(screen.getByRole('button', { name: 'Trước' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sau' })).toBeDisabled();
  });
});
