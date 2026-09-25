import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../app/App';

describe('App Component', () => {
  it('renders brand name and navigation successfully', () => {
    render(<App />);

    expect(screen.getByText('StayHub')).toBeInTheDocument();
    expect(screen.getByText('Trang chủ')).toBeInTheDocument();
    expect(screen.getByText('Khách sạn')).toBeInTheDocument();
    expect(screen.getByText('Đặt phòng')).toBeInTheDocument();
  });

  it('renders hero headline on home page', () => {
    render(<App />);

    expect(
      screen.getByText('Tìm nơi dừng chân lý tưởng cho mọi hành trình')
    ).toBeInTheDocument();
  });
});
