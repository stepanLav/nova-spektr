/**
 * Accordion — shadcn/ui component
 * Replaces: shared/ui-kit/Accordion/Accordion.tsx, shared/ui/Accordion/Accordion.tsx
 *
 * API compatibility: same compound API (Accordion.Trigger, Accordion.Content)
 * Enhancement: no CSS file dependency, cleaner animations via tailwindcss-animate
 */
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { type ComponentPropsWithoutRef, type ElementRef, type PropsWithChildren, createContext, forwardRef, useContext, useDeferredValue, useId, useMemo } from 'react';

import { useExternalState } from '@/shared/lib/hooks';
import { Icon } from '@/shared/ui/Icon/Icon';
import { cn } from '../lib/utils';

// ─── Shadcn-style exports ─────────────────────────────────────────────────────

export const AccordionRoot = AccordionPrimitive.Root;

export const AccordionItem = forwardRef<
  ElementRef<typeof AccordionPrimitive.Item>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn('border-b border-divider', className)} {...props} />
));
AccordionItem.displayName = 'AccordionItem';

export const AccordionTrigger = forwardRef<
  ElementRef<typeof AccordionPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-4 text-footnote font-medium transition-all',
        '[&[data-state=open]>svg]:rotate-180',
        className,
      )}
      {...props}
    >
      {children}
      <svg
        className="h-4 w-4 shrink-0 text-icon-default transition-transform duration-200"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

export const AccordionContent = forwardRef<
  ElementRef<typeof AccordionPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

// ─── Nova Spektr Accordion (compatible API) ───────────────────────────────────

const Context = createContext<{ open: boolean }>({ open: false });

type RootProps = PropsWithChildren<{
  initialOpen?: boolean;
  open?: boolean;
  onToggle?: (open: boolean) => unknown;
}>;

type TriggerProps = PropsWithChildren<{
  sticky?: boolean;
  className?: string;
}>;

const Trigger = ({ sticky, children, className }: TriggerProps) => {
  const { open } = useContext(Context);

  return (
    <AccordionPrimitive.Header asChild>
      <div className={cn('block w-full', sticky && 'sticky top-0 z-10')}>
        <AccordionPrimitive.Trigger
          className={cn(
            'group flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5',
            'text-caption text-text-secondary uppercase',
            'transition-colors duration-100 hover:bg-action-background-hover',
            sticky && 'bg-background-default',
            className,
          )}
        >
          <div className="flex min-w-0 grow items-center gap-2 truncate text-start">{children}</div>
          <Icon
            className={cn(
              'shrink-0 scale-y-100 text-icon-default transition-all duration-150 group-hover:text-icon-hover',
              open && '-scale-y-100',
            )}
            name="down"
            size={16}
          />
        </AccordionPrimitive.Trigger>
      </div>
    </AccordionPrimitive.Header>
  );
};

const Content = ({ children }: PropsWithChildren) => (
  <AccordionPrimitive.Content className="w-full overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
    <section className="w-full">{children}</section>
  </AccordionPrimitive.Content>
);

const AccordionCompound = ({ initialOpen = false, open: externalOpen, onToggle, children }: RootProps) => {
  const id = useId();
  const [open, setOpen] = useExternalState(initialOpen || externalOpen, onToggle);
  const deferred = useDeferredValue(open);
  const ctx = useMemo(() => ({ open: open ?? false }), [open]);

  return (
    <Context.Provider value={ctx}>
      <AccordionPrimitive.Root
        className="w-full"
        collapsible
        type="single"
        value={deferred ? id : ''}
        onValueChange={(value) => setOpen(value === id)}
      >
        <AccordionPrimitive.Item value={id}>{children}</AccordionPrimitive.Item>
      </AccordionPrimitive.Root>
    </Context.Provider>
  );
};

/**
 * Accordion — collapsible section
 *
 * @example
 * <Accordion>
 *   <Accordion.Trigger>Advanced Settings</Accordion.Trigger>
 *   <Accordion.Content>
 *     <p>Hidden content here</p>
 *   </Accordion.Content>
 * </Accordion>
 *
 * @example
 * // Controlled
 * <Accordion open={isOpen} onToggle={setOpen}>
 *   <Accordion.Trigger sticky>Filters</Accordion.Trigger>
 *   <Accordion.Content>...</Accordion.Content>
 * </Accordion>
 */
export const Accordion = Object.assign(AccordionCompound, {
  Trigger,
  Content,
});
