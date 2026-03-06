/**
 * Alert — shadcn/ui component
 * Replaces: shared/ui/Alert/Alert.tsx (66 usages)
 *
 * API compatibility: same compound API (Alert.Item), same props
 * Enhancement: CVA-based variants, no separate CSS file
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { type PropsWithChildren, Children } from 'react';

import { IconButton } from '@/shared/ui/Buttons';
import { Icon } from '@/shared/ui/Icon/Icon';
import { FootnoteText, HeadlineText } from '@/shared/ui/Typography';
import { cn } from '../lib/utils';

// ─── Variant definitions ──────────────────────────────────────────────────────

export const alertVariants = cva(
  'w-full rounded-lg border p-[15px]',
  {
    variants: {
      variant: {
        info: 'bg-alert-background border-alert-border',
        warn: 'bg-alert-background-warning border-alert-border-warning',
        error: 'bg-alert-background-negative border-alert-border-negative',
        success: 'bg-alert-background-positive border-icon-positive',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
);

// Icon name per variant
const ICON_NAME = {
  info: 'info',
  warn: 'warn',
  error: 'warn',
  success: 'checkmarkOutline',
} as const;

// Icon color class per variant
const ICON_CLASS = {
  info: 'shrink-0 text-icon-alert',
  warn: 'shrink-0 text-icon-warning',
  error: 'shrink-0 text-icon-negative',
  success: 'shrink-0 text-text-positive',
} as const;

// ─── Alert.Item ───────────────────────────────────────────────────────────────

type ItemProps = PropsWithChildren<{
  active?: boolean;
  withDot?: boolean;
  className?: string;
}>;

const Item = ({ active = true, withDot = true, children, className }: ItemProps) => {
  if (!active) return null;

  return (
    <li className={cn('flex gap-x-1', className)}>
      {withDot && <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-current" />}
      <FootnoteText className="max-w-full tracking-tight">{children}</FootnoteText>
    </li>
  );
};

// ─── Alert Root ───────────────────────────────────────────────────────────────

type AlertProps = VariantProps<typeof alertVariants> & {
  title: string;
  active: boolean;
  className?: string;
  wrapperClassName?: string;
  dataTestId?: string;
  onClose?: () => void;
};

/**
 * Alert — notification banner with variants
 *
 * @example
 * // Info (default)
 * <Alert active={hasError} variant="info" title="Note">
 *   Please verify your address before proceeding.
 * </Alert>
 *
 * @example
 * // Error with list
 * <Alert active={!!errors} variant="error" title="Validation errors">
 *   <Alert.Item>Invalid address format</Alert.Item>
 *   <Alert.Item>Amount exceeds balance</Alert.Item>
 * </Alert>
 *
 * @example
 * // Dismissible
 * <Alert active={show} variant="warn" title="Warning" onClose={() => setShow(false)}>
 *   This action cannot be undone.
 * </Alert>
 */
const AlertRoot = ({
  title,
  active,
  variant = 'info',
  wrapperClassName,
  className,
  children,
  dataTestId = 'alert',
  onClose,
}: PropsWithChildren<AlertProps>) => {
  if (!active) return null;

  const isList = Children.toArray(children).length > 0;
  const iconName = ICON_NAME[variant ?? 'info'];
  const iconClass = ICON_CLASS[variant ?? 'info'];

  return (
    <div
      data-testid={dataTestId}
      className={cn(alertVariants({ variant }), wrapperClassName)}
    >
      <div className="flex items-start gap-x-1.5 text-text-primary">
        <div className="flex max-w-full flex-1 flex-col gap-y-1">
          <div className="flex items-center gap-x-2">
            <Icon name={iconName} size={14} className={iconClass} />
            <HeadlineText>{title}</HeadlineText>
          </div>
          <div className="flex w-full flex-col gap-1 text-footnote tracking-tight">
            {isList ? (
              <ul className={cn('flex list-none flex-col gap-y-1 pl-5.5', className)}>{children}</ul>
            ) : (
              children
            )}
          </div>
        </div>
        {onClose && <IconButton size={14} name="close" onClick={onClose} />}
      </div>
    </div>
  );
};

export const Alert = Object.assign(AlertRoot, {
  Item,
});
