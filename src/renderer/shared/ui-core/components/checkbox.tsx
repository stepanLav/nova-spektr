/**
 * Checkbox — shadcn/ui component
 * Replaces: shared/ui-kit/Checkbox/Checkbox.tsx
 *
 * API compatibility: same props as original Checkbox
 * Enhancement: CVA-based styling, cleaner class logic
 */
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { type ComponentPropsWithoutRef, type ElementRef, type MouseEvent, type PropsWithChildren, forwardRef } from 'react';

import { Icon } from '@/shared/ui/Icon/Icon';
import { LabelText } from '@/shared/ui/Typography';
import { cn } from '../lib/utils';

// ─── Base Radix Checkbox (for direct shadcn use) ──────────────────────────────

export const CheckboxRoot = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary',
      'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
CheckboxRoot.displayName = CheckboxPrimitive.Root.displayName;

// ─── Nova Spektr Checkbox (compatible API) ────────────────────────────────────

type Props = {
  checked?: boolean;
  semiChecked?: boolean;
  disabled?: boolean;
  checkboxPosition?: 'center' | 'top';
  onChange?: (checked: boolean, semiChecked?: boolean) => void;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

/**
 * Checkbox with optional label and indeterminate state support
 *
 * @example
 * // Simple checkbox
 * <Checkbox checked={selected} onChange={setSelected} />
 *
 * @example
 * // With label
 * <Checkbox checked={agree} onChange={setAgree}>
 *   I agree to terms
 * </Checkbox>
 *
 * @example
 * // Indeterminate (partial selection)
 * <Checkbox semiChecked={someSelected} onChange={handleChange} />
 */
export const Checkbox = ({
  checked,
  semiChecked,
  disabled,
  checkboxPosition = 'center',
  children,
  onChange,
  onClick,
}: PropsWithChildren<Props>) => {
  const checkedState = checked ? true : semiChecked ? 'indeterminate' : false;
  const iconColor = disabled ? 'text-filter-border' : 'text-white';

  const handleChange = (value: boolean | 'indeterminate') => {
    if (!onChange) return;
    const isSemi = value === 'indeterminate';
    onChange(!isSemi && !!value, isSemi);
  };

  return (
    <LabelText
      className={cn(
        'flex gap-x-2 text-inherit hover:cursor-pointer',
        checkedState === false && 'text-text-secondary',
        disabled && 'text-text-tertiary hover:cursor-default',
      )}
    >
      <CheckboxPrimitive.Root
        checked={checkedState}
        disabled={disabled}
        onCheckedChange={handleChange}
        onClick={onClick}
        className={cn(
          'group relative flex h-4 w-4 shrink-0 items-center justify-center rounded-sm',
          'border border-filter-border bg-button-text',
          (checked || semiChecked) &&
            'border-0 border-icon-accent-default bg-primary-button-background-default',
          'hover:shadow-card-shadow aria-checked:hover:bg-primary-button-background-active',
          'disabled:border disabled:border-filter-border disabled:bg-main-app-background',
          'disabled:aria-checked:bg-main-app-background',
          !disabled && 'hover:cursor-pointer',
          checkboxPosition === 'center' && 'self-center',
          checkboxPosition === 'top' && 'mt-1 self-start',
        )}
      >
        <CheckboxPrimitive.Indicator>
          {checked && <Icon name="checked" size={16} className={iconColor} />}
          {!checked && semiChecked && <Icon name="semiChecked" size={16} className={iconColor} />}
        </CheckboxPrimitive.Indicator>
        {!checked && !semiChecked && !disabled && (
          <span className="pointer-events-none absolute opacity-0 transition-opacity group-hover:opacity-100">
            <Icon name="checked" size={16} className="text-filter-border" />
          </span>
        )}
      </CheckboxPrimitive.Root>
      {children}
    </LabelText>
  );
};
