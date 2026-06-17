import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

/**
 * Input con label, error y helper. Compatible con React Hook Form:
 * <Field label="Correo" {...register('email')} error={errors.email?.message} />
 */
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, helperText, leftIcon, rightIcon, className, id, type = 'text', ...props },
  ref,
) {
  const fieldId = id ?? props.name ?? label.replace(/\s+/g, '-').toLowerCase();
  const describedBy = error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined;

  return (
    <div className="w-full">
      <label htmlFor={fieldId} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={fieldId}
          type={type}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            'block w-full rounded-xl border bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-brand-500',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error
              ? 'border-bad-500 focus:ring-bad-500'
              : 'border-slate-300',
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
            {rightIcon}
          </span>
        )}
      </div>
      {error ? (
        <p id={`${fieldId}-error`} className="mt-1 text-sm text-bad-600">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${fieldId}-helper`} className="mt-1 text-sm text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});
