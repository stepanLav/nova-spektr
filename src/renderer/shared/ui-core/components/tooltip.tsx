/**
 * Tooltip — shadcn/ui component
 * Replaces: shared/ui-kit/Tooltip/Tooltip.tsx
 *
 * API compatibility: same compound API (Tooltip.Trigger, Tooltip.Content)
 * Enhancement: no theme context dependency, simpler portal handling
 */
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type PropsWithChildren,
  type ReactElement,
  createContext,
  forwardRef,
  useContext,
  useMemo,
} from 'react';

import { cn } from '../lib/utils';

// ─── Shadcn-style exports ─────────────────────────────────────────────────────

export const TooltipProvider = TooltipPrimitive.Provider;
export const TooltipRoot = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = forwardRef<
  ElementRef<typeof TooltipPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden rounded-md bg-switch-background-active px-2 py-1',
        'text-help-text text-white',
        'animate-in fade-in-0 zoom-in-95',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// ─── Nova Spektr Tooltip (compatible API) ─────────────────────────────────────

type ContextProps = {
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  testId?: string;
};

const Context = createContext<ContextProps>({});

type RootProps = PropsWithChildren<
  ContextProps & {
    open?: boolean;
    onToggle?: (value: boolean) => unknown;
    delay?: number;
    enableHover?: boolean;
  }
>;

const Root = ({
  delay = 100,
  enableHover,
  open,
  onToggle,
  children,
  side = 'top',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  testId = 'Tooltip',
}: RootProps) => {
  const ctx = useMemo(
    () => ({ side, sideOffset, align, alignOffset, testId }),
    [side, sideOffset, align, alignOffset, testId],
  );

  return (
    <Context.Provider value={ctx}>
      <TooltipPrimitive.Provider delayDuration={delay} disableHoverableContent={!enableHover}>
        <TooltipPrimitive.Root open={open} onOpenChange={onToggle}>
          {children}
        </TooltipPrimitive.Root>
      </TooltipPrimitive.Provider>
    </Context.Provider>
  );
};

const Trigger = ({ children }: { children: ReactElement }) => (
  <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
);

const Content = ({ children }: PropsWithChildren) => {
  const { side, align, alignOffset, sideOffset, testId } = useContext(Context);

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className={cn(
          'z-50 h-fit max-h-[var(--radix-tooltip-content-available-height)]',
          'w-fit max-w-48 rounded-md',
          'bg-switch-background-active px-2 py-1',
          'text-help-text text-white',
          'origin-[var(--radix-popper-transform-origin)] duration-100 animate-in fade-in zoom-in-95',
        )}
        side={side}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        data-testid={testId}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-switch-background-active" width={12} height={8} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
};

/**
 * Tooltip — hover info popup
 *
 * @example
 * <Tooltip>
 *   <Tooltip.Trigger>
 *     <IconButton name="info" />
 *   </Tooltip.Trigger>
 *   <Tooltip.Content>More information here</Tooltip.Content>
 * </Tooltip>
 *
 * @example
 * // Bottom placement
 * <Tooltip side="bottom" delay={300}>
 *   <Tooltip.Trigger><span>Hover me</span></Tooltip.Trigger>
 *   <Tooltip.Content>Tooltip text</Tooltip.Content>
 * </Tooltip>
 */
export const Tooltip = Object.assign(Root, {
  Trigger,
  Content,
});
