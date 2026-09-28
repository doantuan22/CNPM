import { formatCurrencyVND } from '../../lib/utils';

export function PriceDisplay({ amount, unit, emphasis = 'primary', className = '' }: {
  amount: number;
  unit?: string;
  emphasis?: 'primary' | 'total' | 'secondary';
  className?: string;
}) {
  return <span className={`price-display price-display--${emphasis} ${className}`.trim()}><strong>{formatCurrencyVND(amount)}</strong>{unit && <small>{unit}</small>}</span>;
}
