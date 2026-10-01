import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'danger-outline' | 'success-outline' | 'warning-outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, loading = false, disabled, onClick, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    const variantStyles = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      danger: 'btn-danger',
      success: 'btn-success',
      'danger-outline': 'btn-danger-outline',
      'success-outline': 'btn-success-outline',
      'warning-outline': 'btn-warning-outline',
    };

    const sizeStyles = {
      sm: 'btn-sm',
      md: '',
      lg: 'btn-lg',
    };

    return (
      <Comp
        ref={ref}
        className={cn('btn', variantStyles[variant], sizeStyles[size], className)}
        disabled={asChild ? undefined : disabled || loading}
        aria-disabled={asChild && (disabled || loading) ? true : undefined}
        aria-busy={loading || undefined}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          if (asChild && (disabled || loading)) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          onClick?.(event);
        }}
        {...props}
        tabIndex={asChild && (disabled || loading) ? -1 : props.tabIndex}
      >
        <span className="btn__inner">
          <span className={loading ? 'btn__content btn__content--loading' : 'btn__content'}>{children}</span>
          {loading && <span className="btn__spinner" aria-hidden="true" />}
        </span>
      </Comp>
    );
  }
);

Button.displayName = 'Button';
