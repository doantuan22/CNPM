import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageSpinner } from './PageSpinner';

describe('PageSpinner', () => {
  it('announces loading to assistive technology without showing text', () => {
    render(<PageSpinner />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Đang tải...');
    expect(status.querySelector('.sr-only')).not.toBeNull();
    expect(status.querySelector('.spinner')).toHaveAttribute('aria-hidden', 'true');
  });

  it('takes a specific label and spacing', () => {
    render(<PageSpinner label="Đang tải điểm đến..." className="py-12" />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Đang tải điểm đến...');
    expect(status).toHaveClass('py-12');
    expect(status).not.toHaveClass('py-16');
  });

  it('defaults to the spacing used for a whole page', () => {
    render(<PageSpinner />);
    expect(screen.getByRole('status')).toHaveClass('flex', 'justify-center', 'py-16');
  });
});
