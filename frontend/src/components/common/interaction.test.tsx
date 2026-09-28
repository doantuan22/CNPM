import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';
import { Combobox } from './Combobox';
import { FeedbackProvider, useConfirm, useToast } from './FeedbackProvider';
import { Input } from './Input';
import { StatusBadge, getStatusTone } from '../domain/StatusBadge';

function ConfirmationHarness() {
  const confirm = useConfirm();
  const [result, setResult] = useState('');
  return <><button type="button" onClick={async () => setResult(await confirm({ title: 'Xác nhận thao tác?', description: 'Nội dung sẽ được lưu.', confirmLabel: 'Đồng ý' }) ? 'accepted' : 'cancelled')}>Open confirmation</button><span>{result}</span></>;
}

function ToastHarness() {
  const notify = useToast();
  return <button type="button" onClick={() => notify({ title: 'Đã lưu thay đổi', tone: 'success', duration: 60000 })}>Notify</button>;
}

function ComboboxHarness() {
  const [value, setValue] = useState('');
  return <Combobox label="Tỉnh / Thành phố" value={value} onValueChange={setValue} options={[{ value: '1', label: 'Hà Nội' }, { value: '2', label: 'Hải Phòng' }]} />;
}

describe('shared interaction components', () => {
  it('keeps a loading button disabled and exposes busy state', () => {
    render(<Button loading>Đang lưu</Button>);
    expect(screen.getByRole('button', { name: 'Đang lưu' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Đang lưu' })).toHaveAttribute('aria-busy', 'true');
  });

  it('connects field labels and errors accessibly', () => {
    render(<Input label="Email" type="email" error="Email không hợp lệ" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Email không hợp lệ');
  });

  it('uses neutral styling for an unknown open-domain status', () => {
    expect(getStatusTone('booking', 'Trạng thái mới từ hệ thống')).toBe('neutral');
    render(<StatusBadge domain="booking" status="Trạng thái mới từ hệ thống" />);
    expect(screen.getByText('Trạng thái mới từ hệ thống')).toHaveClass('ui-status--neutral');
  });

  it('supports filtering and selecting a combobox option with the keyboard', async () => {
    const user = userEvent.setup();
    render(<ComboboxHarness />);
    const input = screen.getByRole('combobox', { name: 'Tỉnh / Thành phố' });
    await user.click(input);
    await user.type(input, 'Hải');
    expect(screen.getByRole('option', { name: 'Hải Phòng' })).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(input).toHaveValue('Hải Phòng'));
    expect(input).toHaveValue('Hải Phòng');
  });

  it('uses the shared confirmation dialog and resolves cancellation', async () => {
    const user = userEvent.setup();
    render(<FeedbackProvider><ConfirmationHarness /></FeedbackProvider>);
    await user.click(screen.getByRole('button', { name: 'Open confirmation' }));
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Xác nhận thao tác?');
    await user.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(await screen.findByText('cancelled')).toBeInTheDocument();
  });

  it('announces a success toast in a live status region', async () => {
    const user = userEvent.setup();
    render(<FeedbackProvider><ToastHarness /></FeedbackProvider>);
    await user.click(screen.getByRole('button', { name: 'Notify' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Đã lưu thay đổi');
  });
});
