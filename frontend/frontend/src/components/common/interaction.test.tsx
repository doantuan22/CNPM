import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';
import { Combobox } from './Combobox';
import { FeedbackProvider, useConfirm, useToast } from './FeedbackProvider';
import { Input } from './Input';
import { GuestPicker } from './GuestPicker';
import { QuantityStepper } from './QuantityStepper';
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

function GuestPickerHarness() {
  const [value, setValue] = useState(2);
  return <GuestPicker value={value} onChange={setValue} />;
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

  it('bounds room counts and announces the selected quantity', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [value, setValue] = useState(1);
      return <QuantityStepper label="phòng Deluxe" value={value} min={0} max={2} onChange={setValue} />;
    }
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Tăng phòng Deluxe' }));
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tăng phòng Deluxe' })).toBeDisabled();
  });

  it('opens the guest picker, updates the contract value and closes on Escape', async () => {
    const user = userEvent.setup();
    render(<GuestPickerHarness />);
    const trigger = screen.getByRole('button', { name: 'Số khách, 2 khách' });
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Chọn số khách' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tăng khách' }));
    expect(screen.getByRole('button', { name: 'Số khách, 3 khách' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Chọn số khách' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Số khách, 3 khách' })).toHaveFocus();
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
