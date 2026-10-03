import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterChip } from './FilterChip';

describe('FilterChip', () => {
  it('exposes its state as aria-pressed and reports clicks', async () => {
    const onClick = vi.fn();
    const { rerender } = render(<FilterChip pressed={false} onClick={onClick}>Hủy miễn phí</FilterChip>);

    const chip = screen.getByRole('button', { name: 'Hủy miễn phí' });
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    await userEvent.setup().click(chip);
    expect(onClick).toHaveBeenCalledOnce();

    rerender(<FilterChip pressed onClick={onClick}>Hủy miễn phí</FilterChip>);
    expect(screen.getByRole('button', { name: 'Hủy miễn phí' })).toHaveAttribute('aria-pressed', 'true');
  });
});
