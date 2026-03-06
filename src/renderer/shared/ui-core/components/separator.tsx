/**
 * Separator — shadcn/ui component
 * Replaces: shared/ui/Separator/Separator.tsx
 *
 * API compatibility: same props as original Separator
 * Enhancement: uses Radix UI Separator primitive for better accessibility
 */
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { type ComponentPropsWithoutRef, type ElementRef, type PropsWithChildren, forwardRef } from 'react';

import { CaptionText } from '@/shared/ui/Typography';
import { cn } from '../lib/utils';

type SeparatorProps = ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
  className?: string;
  vertical?: boolean;
};

/**
 * Base Radix separator (horizontal divider line)
 * Used internally and for simple dividers without children
 */
const SeparatorRoot = forwardRef<ElementRef<typeof SeparatorPrimitive.Root>, SeparatorProps>(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  ),
);
SeparatorRoot.displayName = SeparatorPrimitive.Root.displayName;

type Props = PropsWithChildren<{
  className?: string;
  vertical?: boolean;
}>;

/**
 * Separator — Nova Spektr component
 * Supports optional label text and vertical orientation
 *
 * @example
 * // Simple divider
 * <Separator />
 *
 * @example
 * // With label
 * <Separator>OR</Separator>
 *
 * @example
 * // Vertical
 * <Separator vertical />
 */
export const Separator = ({ className, vertical, children }: Props) => {
  if (!children) {
    return (
      <SeparatorRoot
        orientation={vertical ? 'vertical' : 'horizontal'}
        className={cn('bg-divider', className)}
      />
    );
  }

  if (vertical) {
    return (
      <div className={cn('flex items-center border-divider', className)}>
        <SeparatorRoot orientation="vertical" className="bg-divider" />
        <CaptionText className="my-4 text-text-tertiary uppercase" align="center">
          {children}
        </CaptionText>
        <SeparatorRoot orientation="vertical" className="bg-divider" />
      </div>
    );
  }

  return (
    <div className={cn('flex w-full items-center', className)}>
      <SeparatorRoot className="bg-divider" />
      <CaptionText className="mx-4 text-text-tertiary uppercase" align="center">
        {children}
      </CaptionText>
      <SeparatorRoot className="bg-divider" />
    </div>
  );
};
