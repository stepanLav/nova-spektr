/**
 * Button — shadcn/ui component with Nova Spektr variant system
 * Replaces: shared/ui/Buttons/Button/Button.tsx
 *
 * API compatibility:
 *   - variant: 'fill' | 'text' | 'chip'  (same as original)
 *   - pallet: 'primary' | 'secondary' | 'error'  (same as original)
 *   - size: 'sm' | 'md'  (same as original)
 *   - isLoading, prefixElement, suffixElement  (same as original)
 *
 * Shadcn additions:
 *   - asChild prop (Radix Slot pattern)
 *   - buttonVariants export (for external use with CVA)
 */
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps, type PropsWithChildren, type ReactNode, forwardRef } from 'react';

import { Loader } from '@/shared/ui/Loader/Loader';
import { cn } from '../lib/utils';

// ─── Variant definitions ──────────────────────────────────────────────────────

export const buttonVariants = cva(
  // Base styles — shared across all variants
  [
    'flex cursor-pointer items-center justify-center gap-x-2',
    'outline-offset-1 transition-colors select-none',
    'disabled:cursor-not-allowed',
    'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
  ],
  {
    variants: {
      /**
       * Visual style of the button
       * - fill: solid background (default)
       * - text: no background, text only
       * - chip: bordered badge-like button
       */
      variant: {
        fill: '',    // pallet-specific styles applied below
        text: 'border-transparent bg-transparent px-2 py-1',
        chip: '',    // pallet-specific styles applied below
      },
      /**
       * Color palette
       * - primary: brand color (#4649f6)
       * - secondary: neutral gray
       * - error: destructive red
       */
      pallet: {
        primary: '',
        secondary: '',
        error: '',
      },
      /**
       * Button size
       * - md: default full-size button
       * - sm: compact button
       */
      size: {
        md: 'box-border h-10.5 rounded-[34px] text-button-large px-4 py-3',
        sm: 'box-border h-6.5 rounded-[34px] text-button-small px-3 py-1',
      },
    },
    compoundVariants: [
      // ── fill × primary ──────────────────────────────────────────────────
      {
        variant: 'fill',
        pallet: 'primary',
        class: [
          'bg-primary-button-background-default text-button-text border-0',
          'hover:bg-primary-button-background-hover',
          'active:bg-primary-button-background-active',
          'disabled:bg-primary-button-background-inactive',
        ],
      },
      // ── fill × secondary ────────────────────────────────────────────────
      {
        variant: 'fill',
        pallet: 'secondary',
        class: [
          'bg-secondary-button-background text-text-primary',
          'hover:bg-secondary-button-background-hover',
          'active:bg-secondary-button-background-active',
          'disabled:bg-action-background-hover disabled:text-button-text-inactive',
        ],
      },
      // ── fill × error ─────────────────────────────────────────────────────
      {
        variant: 'fill',
        pallet: 'error',
        class: [
          'bg-negative-action-background text-text-negative',
          'disabled:bg-action-background-hover disabled:text-button-text-inactive',
        ],
      },
      // ── text × primary ───────────────────────────────────────────────────
      {
        variant: 'text',
        pallet: 'primary',
        class: [
          'text-primary-button-background-default',
          'hover:text-primary-button-background-hover',
          'active:text-primary-button-background-active',
          'disabled:text-primary-button-background-inactive',
        ],
      },
      // ── chip × primary ───────────────────────────────────────────────────
      {
        variant: 'chip',
        pallet: 'primary',
        class: [
          'border border-primary-button-background-default bg-badge-background text-tab-text-accent',
          'hover:border-primary-button-background-hover hover:bg-badge-background-hover',
          'active:border-primary-button-background-hover active:bg-badge-background-hover',
          'disabled:opacity-60',
        ],
      },
      // ── chip × secondary ─────────────────────────────────────────────────
      {
        variant: 'chip',
        pallet: 'secondary',
        class: [
          'border border-secondary-button-background text-text-secondary',
          'hover:border-secondary-button-background-hover hover:bg-hover',
          'active:border-secondary-button-background-active active:bg-hover',
          'disabled:opacity-60',
        ],
      },
    ],
    defaultVariants: {
      variant: 'fill',
      pallet: 'primary',
      size: 'md',
    },
  },
);

// ─── Types ────────────────────────────────────────────────────────────────────

type HTMLButtonProps = Pick<
  ComponentProps<'button'>,
  'onClick' | 'onMouseDown' | 'onPointerDown' | 'onPointerMove' | 'onPointerLeave' | 'disabled' | 'tabIndex' | 'type'
>;

export type ButtonProps = HTMLButtonProps &
  VariantProps<typeof buttonVariants> & {
    className?: string;
    form?: string;
    asChild?: boolean;
    isLoading?: boolean;
    prefixElement?: ReactNode;
    suffixElement?: ReactNode;
    testId?: string;
  };

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Button component with full Nova Spektr variant system
 *
 * @example
 * // Primary fill (default)
 * <Button>Save</Button>
 *
 * @example
 * // Secondary text button
 * <Button variant="text" pallet="secondary">Cancel</Button>
 *
 * @example
 * // Chip / badge-style
 * <Button variant="chip" pallet="primary" size="sm">Filter</Button>
 *
 * @example
 * // Loading state
 * <Button isLoading>Saving...</Button>
 *
 * @example
 * // With icons
 * <Button prefixElement={<PlusIcon />}>Add Wallet</Button>
 *
 * @example
 * // As link (asChild)
 * <Button asChild><a href="/settings">Settings</a></Button>
 */
export const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(
  (
    {
      variant = 'fill',
      pallet = 'primary',
      type = 'button',
      size = 'md',
      form,
      className,
      disabled = false,
      asChild = false,
      prefixElement,
      suffixElement,
      tabIndex,
      children,
      isLoading,
      onClick,
      onMouseDown,
      onPointerDown,
      onPointerMove,
      onPointerLeave,
      testId = 'Button',
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const hasLayout = !!(prefixElement || suffixElement || isLoading);

    return (
      <Comp
        ref={ref}
        type={type}
        form={form}
        disabled={disabled}
        className={cn(
          buttonVariants({ variant, pallet, size }),
          hasLayout && 'justify-between',
          className,
        )}
        tabIndex={tabIndex}
        data-testid={testId}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => !isLoading && onClick?.(e)}
        onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => !isLoading && onMouseDown?.(e)}
        onPointerDown={(e: React.PointerEvent<HTMLButtonElement>) => !isLoading && onPointerDown?.(e)}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        {isLoading && <Loader color="white" />}
        {prefixElement && <div data-testid="prefix">{prefixElement}</div>}
        <div>{children}</div>
        {suffixElement && <div data-testid="suffix">{suffixElement}</div>}
      </Comp>
    );
  },
);

Button.displayName = 'Button';
