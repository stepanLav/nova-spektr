/**
 * Skeleton — shadcn/ui component
 * Replaces: shared/ui/Shimmering/Shimmering.tsx (deprecated)
 *           shared/ui-kit/Skeleton/Skeleton.tsx
 *
 * Unified API that covers both variants.
 */
import { isNumber, isString } from 'lodash';
import { type PropsWithChildren, Children, memo } from 'react';

import { cn } from '../lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type SkeletonBaseProps = {
  className?: string;
  testId?: string;
};

/** Standalone skeleton block (fixed size) */
type StandaloneProps = SkeletonBaseProps & {
  width?: number | string;
  height?: number | string;
  circle?: boolean;
  active?: never;
  children?: never;
};

/** Content-wrapping skeleton (hides children while loading) */
type WrapperProps = PropsWithChildren<
  SkeletonBaseProps & {
    active: boolean;
    fullWidth?: boolean;
    minWidth?: number | string;
    width?: never;
    height?: never;
    circle?: never;
  }
>;

type Props = StandaloneProps | WrapperProps;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toPx = (v: number | string | undefined) =>
  isNumber(v) ? `${v}px` : v;

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Skeleton loading placeholder.
 *
 * @example
 * // Fixed size block
 * <Skeleton width={200} height={20} />
 *
 * @example
 * // Circle avatar placeholder
 * <Skeleton width={40} circle />
 *
 * @example
 * // Wrapping content (hides while loading)
 * <Skeleton active={isLoading}>
 *   <span>Wallet name</span>
 * </Skeleton>
 */
export const Skeleton = memo(
  ({ width, height, circle, fullWidth, minWidth, active, children, className, testId }: Props) => {
    const formattedWidth = toPx(width);
    const formattedHeight = toPx(height);
    const formattedMinWidth = toPx(minWidth);

    // Standalone block (no children)
    if (!children) {
      return (
        <span
          data-testid={testId}
          className={cn(
            'animate-pulse block bg-muted',
            circle ? 'rounded-full' : 'rounded-[10px]',
            className,
          )}
          style={{
            width: formattedWidth,
            height: circle ? formattedWidth : formattedHeight,
            minWidth: formattedMinWidth,
          }}
        />
      );
    }

    // Wrapper mode: hide children during loading
    if (active) {
      return (
        <>
          {Children.map(children, (child) => (
            <span
              data-testid={testId}
              className={cn(
                'animate-pulse block h-fit rounded-[10px] bg-muted *:invisible',
                fullWidth ? 'w-full' : 'w-fit',
                className,
              )}
              style={{ minWidth: formattedMinWidth }}
            >
              {isString(child) ? <span>{child}</span> : child}
            </span>
          ))}
        </>
      );
    }

    // Not active — render children as-is
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  },
);

Skeleton.displayName = 'Skeleton';
