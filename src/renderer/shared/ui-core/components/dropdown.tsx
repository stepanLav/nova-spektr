/**
 * Dropdown — shadcn/ui component
 * Replaces: shared/ui-kit/Dropdown/Dropdown.tsx
 *
 * API:
 *   - Dropdown compound: Dropdown, Dropdown.Trigger, Dropdown.Content,
 *     Dropdown.Item, Dropdown.CheckboxItem, Dropdown.Group, Dropdown.Separator
 *   - Shadcn-style: DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent,
 *     DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuGroup,
 *     DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuSub,
 *     DropdownMenuSubTrigger, DropdownMenuSubContent
 */
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type PropsWithChildren,
  type ReactNode,
  createContext,
  forwardRef,
  useContext,
  useMemo,
} from 'react';

import { cn } from '../lib/utils';

// ─── Context ──────────────────────────────────────────────────────────────────

type ContextProps = {
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  width?: 'auto' | 'trigger';
  keepOpen?: boolean;
  testId?: string;
  avoidCollisions?: boolean;
};

const Context = createContext<ContextProps>({});

// ─── Root ─────────────────────────────────────────────────────────────────────

type RootProps = PropsWithChildren<
  ContextProps & {
    open?: boolean;
    onToggle?: (value: boolean) => void;
  }
>;

const Root = ({
  open,
  onToggle,
  side = 'bottom',
  sideOffset = 8,
  align = 'center',
  alignOffset = 0,
  width = 'auto',
  keepOpen = false,
  testId = 'Dropdown',
  avoidCollisions = false,
  children,
}: RootProps) => {
  const ctx = useMemo(
    () => ({ side, sideOffset, align, alignOffset, width, keepOpen, testId, avoidCollisions }),
    [side, sideOffset, align, alignOffset, width, keepOpen, testId, avoidCollisions],
  );

  return (
    <Context.Provider value={ctx}>
      <DropdownMenuPrimitive.Root modal open={open} onOpenChange={onToggle}>
        {children}
      </DropdownMenuPrimitive.Root>
    </Context.Provider>
  );
};

// ─── Trigger ──────────────────────────────────────────────────────────────────

const Trigger = ({ disabled, children }: PropsWithChildren<{ disabled?: boolean }>) => {
  return (
    <DropdownMenuPrimitive.Trigger disabled={disabled} asChild>
      {children}
    </DropdownMenuPrimitive.Trigger>
  );
};

// ─── Separator ────────────────────────────────────────────────────────────────

const SeparatorItem = () => {
  return (
    <DropdownMenuPrimitive.Separator className="h-px w-full px-2">
      <div className="h-full w-full bg-divider" />
    </DropdownMenuPrimitive.Separator>
  );
};

// ─── Content ──────────────────────────────────────────────────────────────────

const Content = ({ children }: PropsWithChildren) => {
  const { side, sideOffset, align, alignOffset, width, testId, avoidCollisions } = useContext(Context);

  const calculatedWidth = width === 'trigger' ? 'var(--radix-dropdown-menu-trigger-width)' : undefined;

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        loop
        avoidCollisions={avoidCollisions}
        side={side}
        align={align}
        style={{ width: calculatedWidth }}
        collisionPadding={8}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        data-testid={testId}
        className={cn(
          'z-50 flex flex-col overflow-hidden rounded-md border border-token-container-border',
          'bg-block-background-default shadow-shadow-2',
          'h-max min-w-20',
          'max-h-(--radix-popper-available-height)',
          'origin-(--radix-popper-transform-origin) duration-100 animate-in fade-in zoom-in-95',
          { 'max-w-60': width === 'auto' },
        )}
      >
        <div className="flex flex-col gap-y-1 p-1">{children}</div>
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
};

// ─── Group ────────────────────────────────────────────────────────────────────

type GroupProps = PropsWithChildren<{ label?: ReactNode }>;

const Group = ({ label, children }: GroupProps) => {
  return (
    <DropdownMenuPrimitive.Group className="flex flex-col gap-1">
      {label ? (
        <DropdownMenuPrimitive.Label className="px-3 py-1 text-help-text text-text-secondary">
          {label}
        </DropdownMenuPrimitive.Label>
      ) : null}
      {children}
    </DropdownMenuPrimitive.Group>
  );
};

// ─── Item ─────────────────────────────────────────────────────────────────────

type ItemProps = PropsWithChildren<{
  disabled?: boolean;
  testId?: string;
  onSelect?: VoidFunction;
  onClick?: VoidFunction;
}>;

const Item = ({ onSelect, onClick, disabled, testId, children }: ItemProps) => {
  const { keepOpen } = useContext(Context);

  const callback = keepOpen
    ? (e: Event) => {
        e.preventDefault();
        onSelect?.();
      }
    : onSelect;

  return (
    <DropdownMenuPrimitive.Item
      asChild
      data-testid={testId}
      className={cn(
        'flex items-center gap-2 rounded-sm px-3 py-2 text-footnote text-text-secondary',
        'cursor-default bg-block-background-default outline-none',
        {
          'cursor-pointer hover:bg-block-background-hover': !disabled,
          'text-text-tertiary': disabled,
        },
      )}
      disabled={disabled}
      onSelect={callback}
      onClick={onClick}
    >
      <button disabled={disabled}>{children}</button>
    </DropdownMenuPrimitive.Item>
  );
};

// ─── CheckboxItem ─────────────────────────────────────────────────────────────

type CheckboxItemProps = PropsWithChildren<{
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
  onSelect?: VoidFunction;
}>;

const CheckboxItem = ({ checked, onChange, onSelect, disabled, children }: CheckboxItemProps) => {
  const handleSelect = (event: Event) => {
    event.preventDefault();
    onSelect?.();
  };

  return (
    <DropdownMenuPrimitive.CheckboxItem
      checked={checked}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-start text-footnote text-text-secondary',
        'cursor-pointer outline-none',
        {
          'bg-selected-background text-text-primary': checked,
          'bg-block-background-default hover:bg-block-background-hover': !checked,
        },
      )}
      disabled={disabled}
      onCheckedChange={onChange}
      onSelect={handleSelect}
    >
      {/* Simple checkbox indicator */}
      <span
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
          checked ? 'border-primary-button-background-default bg-primary-button-background-default' : 'border-input',
        )}
      >
        {checked && (
          <svg
            viewBox="0 0 12 12"
            fill="none"
            className="h-3 w-3 text-white"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2,6 5,9 10,3" />
          </svg>
        )}
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
};

// ─── Compound export ──────────────────────────────────────────────────────────

export const Dropdown = Object.assign(Root, {
  Trigger,
  Content,
  Item,
  CheckboxItem,
  Group,
  Separator: SeparatorItem,
});

// ─── Shadcn-style primitive exports ──────────────────────────────────────────

export const DropdownMenuRoot = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export const DropdownMenuContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border border-token-container-border',
        'bg-block-background-default p-1 shadow-shadow-2',
        'origin-(--radix-popper-transform-origin) duration-100 animate-in fade-in zoom-in-95',
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

export const DropdownMenuItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Item>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5',
      'text-footnote text-text-secondary outline-none transition-colors',
      'focus:bg-block-background-hover focus:text-text-primary',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      { 'pl-8': inset },
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

export const DropdownMenuCheckboxItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2',
      'text-footnote text-text-secondary outline-none transition-colors',
      'focus:bg-block-background-hover focus:text-text-primary',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <svg viewBox="0 0 12 12" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
          <polyline points="2,6 5,9 10,3" />
        </svg>
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

export const DropdownMenuLabel = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Label>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-help-text font-semibold text-text-secondary', { 'pl-8': inset }, className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

export const DropdownMenuSeparator = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-divider', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export const DropdownMenuSubTrigger = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-footnote outline-none',
      'focus:bg-block-background-hover data-[state=open]:bg-block-background-hover',
      { 'pl-8': inset },
      className,
    )}
    {...props}
  >
    {children}
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="ml-auto h-4 w-4"
    >
      <polyline points="9,18 15,12 9,6" />
    </svg>
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';

export const DropdownMenuSubContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border border-token-container-border',
      'bg-block-background-default p-1 shadow-shadow-2',
      'origin-(--radix-popper-transform-origin) duration-100 animate-in fade-in zoom-in-95',
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';
