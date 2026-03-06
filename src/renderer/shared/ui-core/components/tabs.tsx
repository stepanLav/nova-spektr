/**
 * Tabs — shadcn/ui component
 * Replaces: shared/ui-kit/Tabs/Tabs.tsx, shared/ui/Tabs/Tabs.tsx
 *
 * API compatibility:
 *   - Compound component API: Tabs.List, Tabs.Trigger, Tabs.Content
 *   - Nova Spektr style (pill/card tabs)
 * Enhancement:
 *   - Shadcn-style exports (TabsRoot, TabsList, TabsTrigger, TabsContent)
 */
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { type ComponentPropsWithoutRef, type ElementRef, type PropsWithChildren, forwardRef } from 'react';

import { cn } from '../lib/utils';

// ─── Shadcn-style exports ─────────────────────────────────────────────────────

export const TabsRoot = TabsPrimitive.Root;

export const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-md bg-tab-background p-0.5',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1',
      'text-button-small text-text-secondary',
      'ring-offset-background transition-all',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:bg-white data-[state=active]:text-text-primary data-[state=active]:shadow-card-shadow',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = forwardRef<
  ElementRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// ─── Nova Spektr Tabs (compatible API) ───────────────────────────────────────

type RootProps = PropsWithChildren<{
  value: string;
  className?: string;
  onChange: (value: string) => unknown;
}>;

const List = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <TabsPrimitive.List
    className={cn('mb-2 flex shrink-0 gap-x-1 rounded-md bg-tab-background p-0.5', className)}
  >
    {children}
  </TabsPrimitive.List>
);
List.displayName = 'Tabs.List';

type TriggerProps = PropsWithChildren<{
  value: string;
  disabled?: boolean;
  className?: string;
}>;

const Trigger = ({ value, disabled, children, className }: TriggerProps) => (
  <TabsPrimitive.Trigger
    value={value}
    disabled={disabled}
    className={cn(
      'flex w-full cursor-pointer items-center justify-center gap-1 rounded-sm bg-transparent px-4 py-1.5',
      'text-button-small text-text-secondary transition-all duration-100',
      'data-[state=active]:bg-white data-[state=active]:text-text-primary data-[state=active]:shadow-card-shadow',
      'disabled:cursor-not-allowed',
      className,
    )}
  >
    {children}
  </TabsPrimitive.Trigger>
);
Trigger.displayName = 'Tabs.Trigger';

type ContentProps = PropsWithChildren<{
  value: string;
  className?: string;
}>;

const Content = ({ value, children, className }: ContentProps) => (
  <TabsPrimitive.Content value={value} className={cn('flex-1', className)}>
    {children}
  </TabsPrimitive.Content>
);
Content.displayName = 'Tabs.Content';

const TabsCompound = ({ value, onChange, children, className }: RootProps) => (
  <TabsPrimitive.Root value={value} onValueChange={onChange} className={cn('flex flex-col', className)}>
    {children}
  </TabsPrimitive.Root>
);

/**
 * Tabs — compound component
 *
 * @example
 * <Tabs value={tab} onChange={setTab}>
 *   <Tabs.List>
 *     <Tabs.Trigger value="assets">Assets</Tabs.Trigger>
 *     <Tabs.Trigger value="staking">Staking</Tabs.Trigger>
 *   </Tabs.List>
 *   <Tabs.Content value="assets"><AssetsView /></Tabs.Content>
 *   <Tabs.Content value="staking"><StakingView /></Tabs.Content>
 * </Tabs>
 */
export const Tabs = Object.assign(TabsCompound, {
  List,
  Trigger,
  Content,
});
