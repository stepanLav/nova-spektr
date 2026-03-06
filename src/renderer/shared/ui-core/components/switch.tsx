/**
 * Switch — shadcn/ui component
 * Replaces: shared/ui/Switch/Switch.tsx (HeadlessUI → Radix UI)
 *
 * API compatibility: same props as original Switch
 * Enhancement: uses Radix UI Switch primitive for better accessibility
 */
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { type ComponentPropsWithoutRef, type ElementRef, type PropsWithChildren, forwardRef } from 'react';

import { LabelText } from '@/shared/ui/Typography';
import { cn } from '../lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  className?: string;
  knobClassName?: string;
  switchClassName?: string;
  labelPosition?: 'left' | 'right';
  variant?: 'primary' | 'accent';
  onChange?: (checked: boolean) => void;
};

// ─── Base Radix Switch (for direct use) ──────────────────────────────────────

export type SwitchProps = ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>;

export const SwitchRoot = forwardRef<ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  ({ className, ...props }, ref) => (
    <SwitchPrimitive.Root
      className={cn(
        'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-switch-background-active data-[state=unchecked]:bg-switch-background-inactive',
        className,
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block h-4 w-4 rounded-full bg-knob-background shadow-knob-shadow',
          'transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  ),
);
SwitchRoot.displayName = SwitchPrimitive.Root.displayName;

// ─── Nova Spektr Switch (compatible API) ─────────────────────────────────────

/**
 * Switch component with optional label
 *
 * @example
 * // Simple toggle
 * <Switch checked={isEnabled} onChange={setEnabled} />
 *
 * @example
 * // With left label (default)
 * <Switch checked={darkMode} onChange={setDarkMode}>Dark mode</Switch>
 *
 * @example
 * // With right label
 * <Switch labelPosition="right" checked={notify} onChange={setNotify}>
 *   Enable notifications
 * </Switch>
 *
 * @example
 * // Accent variant (green when checked)
 * <Switch variant="accent" checked={active} onChange={setActive} />
 */
export const Switch = ({
  checked,
  defaultChecked,
  disabled,
  className,
  knobClassName,
  switchClassName,
  onChange,
  children,
  labelPosition = 'left',
  variant = 'primary',
}: PropsWithChildren<Props>) => {
  const labelEl = children ? (
    <label className="cursor-pointer">
      <LabelText className="cursor-pointer text-text-secondary">{children}</LabelText>
    </label>
  ) : null;

  return (
    <div className={cn('flex items-center justify-between gap-x-2.5', className)}>
      {labelEl && labelPosition === 'left' && labelEl}
      <SwitchPrimitive.Root
        disabled={disabled}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onChange}
        className={cn(
          'relative inline-flex w-7.5 cursor-pointer items-center rounded-full border p-px transition',
          checked || defaultChecked
            ? variant === 'accent'
              ? 'border-transparent bg-label-background-green'
              : 'border-transparent bg-switch-background-active'
            : 'border-container-border bg-switch-background-inactive',
          disabled && 'opacity-50',
          switchClassName,
        )}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'inline-block h-3.5 w-3.5 rounded-full bg-knob-background shadow-knob-shadow transition',
            knobClassName,
          )}
        />
      </SwitchPrimitive.Root>
      {labelEl && labelPosition === 'right' && labelEl}
    </div>
  );
};
