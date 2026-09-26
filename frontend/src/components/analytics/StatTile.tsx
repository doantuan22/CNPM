import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface StatTileProps {
  label: string;
  value: string;
  icon?: ReactNode;
  tone?: 'default' | 'positive' | 'negative';
}

export function StatTile({ label, value, icon, tone = 'default' }: StatTileProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <p
        className={cn(
          'mt-2 text-xl font-bold',
          tone === 'positive' ? 'text-green-700' : tone === 'negative' ? 'text-red-700' : 'text-slate-900'
        )}
      >
        {value}
      </p>
    </div>
  );
}
