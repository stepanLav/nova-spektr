/**
 * Input — shadcn/ui component
 * Replaces: shared/ui-kit/Input/Input.tsx
 *
 * API compatibility: same props as original Input
 * Enhancement: cleaner CVA-based styling, shadcn Input export for Form integration
 */
import { type ChangeEvent, type ClipboardEvent, type ComponentPropsWithoutRef, type ReactNode, forwardRef, useId } from 'react';

import { cn } from '../lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type InputSpecificProps = {
  invalid?: boolean;
  height?: 'sm' | 'md';
  width?: 'full' | 'md';
  textSize?: 'md' | 'lg';
  prefixElement?: ReactNode;
  suffixElement?: ReactNode;
  testId?: string;
  onChange?: (value: string) => void;
  onChangeEvent?: (event: ChangeEvent<HTMLInputElement>) => void;
  onPaste?: (event: ClipboardEvent) => void;
};

export type InputProps = Omit<ComponentPropsWithoutRef<'input'>, 'onChange' | 'onPaste'> & InputSpecificProps;

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Input field with optional prefix/suffix elements
 *
 * @example
 * // Simple input
 * <Input placeholder="Enter address..." onChange={setValue} />
 *
 * @example
 * // With prefix icon
 * <Input prefixElement={<SearchIcon />} placeholder="Search..." />
 *
 * @example
 * // Invalid state
 * <Input invalid value={badValue} />
 *
 * @example
 * // Full width, larger height
 * <Input width="full" height="md" textSize="lg" />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      height = 'sm',
      width = 'md',
      textSize = 'md',
      name,
      value,
      placeholder,
      invalid,
      disabled,
      autoFocus,
      spellCheck = false,
      prefixElement,
      suffixElement,
      testId,
      onChange,
      onChangeEvent,
      onPaste,
      className,
      ...props
    },
    ref,
  ) => {
    const id = useId();

    return (
      <label
        className={cn(
          'box-border flex cursor-text items-center gap-x-2 rounded-sm px-[11px]',
          'border border-filter-border bg-input-background',
          height === 'sm' ? 'h-[34px]' : 'h-[42px]',
          width === 'full' && 'w-full',
          invalid && 'border-filter-border-negative',
          !invalid && 'focus-within:border-active-container-border',
          !disabled && 'hover:shadow-card-shadow',
          disabled && 'bg-input-background-disabled',
          className,
        )}
      >
        {prefixElement && <div className="flex shrink-0">{prefixElement}</div>}
        <input
          id={id}
          ref={ref}
          type={type}
          name={name}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          spellCheck={spellCheck}
          data-testid={testId}
          className={cn(
            'h-full w-full appearance-none truncate bg-transparent',
            'text-footnote text-text-primary outline-offset-1',
            'placeholder:text-text-secondary focus:ring-0 focus-visible:outline-none!',
            textSize === 'lg' && 'text-headline',
            disabled && 'text-text-tertiary placeholder:text-text-tertiary',
          )}
          onChange={(e) => {
            onChange?.(e.target.value);
            onChangeEvent?.(e);
          }}
          onPaste={(e) => onPaste?.(e)}
          {...props}
        />
        {suffixElement && <div className="flex shrink-0">{suffixElement}</div>}
      </label>
    );
  },
);

Input.displayName = 'Input';
