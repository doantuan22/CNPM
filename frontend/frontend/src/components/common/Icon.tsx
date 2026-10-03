import type { CSSProperties } from 'react';
import { cn } from '../../lib/utils';

const WEIGHT_CLASS = { regular: 'ph', fill: 'ph-fill', bold: 'ph-bold', duotone: 'ph-duotone' } as const;

export interface IconProps {
  /** Phosphor icon name without the `ph-` prefix, e.g. `magnifying-glass`. */
  name: string;
  weight?: keyof typeof WEIGHT_CLASS;
  /** Pixel size. Omit to inherit the font size of the parent. */
  size?: number;
  className?: string;
  /** Pass a label only when the icon is the sole content of its control; icons are decorative otherwise. */
  label?: string;
}

/** The one icon set (Phosphor, loaded as a font in main.tsx). Decorative by default. */
export function Icon({ name, weight = 'regular', size, className, label }: IconProps) {
  const style: CSSProperties | undefined = size ? { fontSize: size } : undefined;
  return (
    <i
      className={cn(WEIGHT_CLASS[weight], `ph-${name}`, className)}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
