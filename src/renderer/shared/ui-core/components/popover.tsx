/**
 * Popover — shadcn/ui component
 * Replaces: shared/ui-kit/Popover/Popover.tsx
 *
 * API:
 *   - Popover compound: Popover (Root), Popover.Trigger, Popover.Anchor, Popover.Content
 *   - Shadcn-style: PopoverRoot, PopoverTrigger, PopoverAnchor, PopoverContent
 */
import * as PopoverPrimitive from '@radix-ui/react-popover';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type PropsWithChildren,
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useState,
} from 'react';

import { cn } from '../lib/utils';

// ─── Context ──────────────────────────────────────────────────────────────────

type ContextProps = {
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  testId?: string;
  enableHover?: boolean;
  setHoverOpen?: (open: boolean) => void;
};

const Context = createContext<ContextProps>({});

// ─── Root ─────────────────────────────────────────────────────────────────────

type RootProps = PropsWithChildren<
  ContextProps & {
    open?: boolean;
    onToggle?: (value: boolean) => void;
    dialog?: boolean;
  }
>;

const Root = ({
  dialog,
  open,
  onToggle,
  side = 'bottom',
  sideOffset = 8,
  align = 'center',
  alignOffset = 0,
  testId = 'Popover',
  enableHover,
  children,
}: RootProps) => {
  const [hoverOpen, setHoverOpen] = useState(false);

  const ctx = useMemo(
    () => ({
      side,
      sideOffset,
      align,
      alignOffset,
      testId,
      enableHover,
      setHoverOpen: enableHover ? setHoverOpen : undefined,
    }),
    [side, sideOffset, align, alignOffset, testId, enableHover],
  );

  return (
    <Context.Provider value={ctx}>
      <PopoverPrimitive.Root
        modal={enableHover ? false : !dialog}
        open={enableHover ? hoverOpen : open}
        onOpenChange={enableHover ? undefined : onToggle}
      >
        {children}
      </PopoverPrimitive.Root>
    </Context.Provider>
  );
};

// ─── Trigger ──────────────────────────────────────────────────────────────────

const Trigger = ({ children }: PropsWithChildren) => {
  const { enableHover, setHoverOpen } = useContext(Context);

  return (
    <PopoverPrimitive.Trigger
      asChild
      onMouseEnter={enableHover && setHoverOpen ? () => setHoverOpen(true) : undefined}
      onMouseLeave={enableHover && setHoverOpen ? () => setHoverOpen(false) : undefined}
    >
      {children}
    </PopoverPrimitive.Trigger>
  );
};

// ─── Anchor ───────────────────────────────────────────────────────────────────

const Anchor = ({ children }: PropsWithChildren) => {
  return <PopoverPrimitive.Anchor asChild>{children}</PopoverPrimitive.Anchor>;
};

// ─── Content ──────────────────────────────────────────────────────────────────

const Content = ({ children }: PropsWithChildren) => {
  const { align, alignOffset, side, sideOffset, testId, enableHover, setHoverOpen } = useContext(Context);

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        asChild
        hideWhenDetached
        side={side}
        align={align}
        collisionPadding={8}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        data-testid={testId}
        onClick={e => e.stopPropagation()}
        onMouseEnter={enableHover && setHoverOpen ? () => setHoverOpen(true) : undefined}
        onMouseLeave={enableHover && setHoverOpen ? () => setHoverOpen(false) : undefined}
      >
        <div
          className={cn(
            'pointer-events-auto z-50 h-fit min-h-0 overflow-hidden rounded-md',
            'border border-token-container-border bg-block-background-default text-body shadow-shadow-2',
            'origin-(--radix-popper-transform-origin) duration-100 animate-in fade-in zoom-in-95',
            'max-h-(--radix-popper-available-height)',
          )}
        >
          {children}
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
};

// ─── Compound export ──────────────────────────────────────────────────────────

export const Popover = Object.assign(Root, { Trigger, Anchor, Content });

// ─── Shadcn-style primitive exports ──────────────────────────────────────────

export const PopoverRoot = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

export const PopoverContent = forwardRef<
  ElementRef<typeof PopoverPrimitive.Content>,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 8, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-72 rounded-md border border-token-container-border bg-block-background-default p-4',
        'text-body shadow-shadow-2',
        'origin-(--radix-popper-transform-origin) duration-100 animate-in fade-in zoom-in-95',
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = 'PopoverContent';
