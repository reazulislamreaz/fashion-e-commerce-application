'use client';

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, required, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full text-left">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold text-stone-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          required={required}
          className={`w-full  border bg-white px-3.5 py-2.5 text-xs font-medium text-stone-900 placeholder:text-stone-400 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:border-transparent disabled:opacity-50 disabled:bg-stone-50 ${
            error
              ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus-visible:ring-rose-500'
              : 'border-stone-300 hover:border-stone-400'
          } ${className}`}
          {...props}
        />

        {error ? (
          <p className="text-[11px] font-semibold text-rose-600">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] font-medium text-stone-500">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, required, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full text-left">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-bold text-stone-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          rows={rows}
          className={`w-full  border bg-white px-3.5 py-2.5 text-xs font-medium text-stone-900 placeholder:text-stone-400 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:border-transparent disabled:opacity-50 disabled:bg-stone-50 ${
            error
              ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus-visible:ring-rose-500'
              : 'border-stone-300 hover:border-stone-400'
          } ${className}`}
          {...props}
        />

        {error ? (
          <p className="text-[11px] font-semibold text-rose-600">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] font-medium text-stone-500">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
