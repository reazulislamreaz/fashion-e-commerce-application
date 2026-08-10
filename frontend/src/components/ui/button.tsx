'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { IconSpinner } from './icons';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none';

    const variantStyles = {
      primary:
        'bg-stone-950 text-white hover:bg-[#C9A227] hover:text-stone-950 active:scale-[0.98] ',
      secondary:
        'bg-stone-100 text-stone-900 hover:bg-stone-200 active:scale-[0.98]',
      outline:
        'border border-stone-300 bg-white text-stone-800 hover:border-stone-900 hover:bg-stone-50 active:scale-[0.98]',
      ghost:
        'text-stone-700 hover:bg-stone-100 hover:text-stone-950 active:scale-[0.98]',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.98] ',
    };

    const sizeStyles = {
      sm: 'h-8  px-3 text-[11px] gap-1.5',
      md: 'h-10  px-4 text-xs gap-2',
      lg: 'h-12  px-6 text-sm gap-2.5',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`cursor-pointer ${`${baseStyles}`} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading && <IconSpinner className="size-4 animate-spin shrink-0" />}
        <span>{children}</span>
      </button>
    );
  },
);

Button.displayName = 'Button';
