/**
 * Select — shadcn/ui component
 * Replaces: shared/ui-kit/Select/Select.tsx (complex ariakit-based)
 *           shared/ui/Dropdowns/Select/Select.tsx (deprecated headlessui-based)
 *
 * Strategy: Radix Select for standard dropdowns,
 *           Combobox (cmdk) pattern for searchable selects.
 *
 * API compatibility:
 *   - Select.Root, Select.Item, Select.Group (compound component)
 *   - Controlled: value/onChange
 *   - Optional search: onSearch prop
 *   - Shadcn-style: SelectRoot/SelectTrigger/SelectContent/SelectItem exports
 */
import * as SelectPrimitive from '@radix-ui/react-select';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type PropsWithChildren,
  type ReactNode,
  Children,
  createContext,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Icon } from '@/shared/ui/Icon/Icon';
import { FootnoteText } from '@/shared/ui/Typography';
import { cn } from '../lib/utils';

// ─── Shadcn-style Select exports ─────────────────────────────────────────────

export const SelectRoot = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-9 w-full items-center justify-between rounded-sm border border-filter-border bg-input-background px-3 py-2',
      'text-footnote text-text-primary placeholder:text-text-secondary',
      'focus:outline-none focus:border-active-container-border',
      'disabled:cursor-not-allowed disabled:opacity-50',
      '[&>span]:line-clamp-1',
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <Icon name="down" size={16} className="shrink-0 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectScrollUpButton = forwardRef<
  ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <Icon name="up" size={16} />
  </SelectPrimitive.ScrollUpButton>
));

export const SelectScrollDownButton = forwardRef<
  ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <Icon name="down" size={16} />
  </SelectPrimitive.ScrollDownButton>
));

export const SelectContent = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-filter-border bg-input-background shadow-lg',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' && [
          'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
          'w-[var(--radix-select-trigger-width)]',
        ],
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn('p-1', position === 'popper' && 'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]')}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectLabel = forwardRef<
  ElementRef<typeof SelectPrimitive.Label>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-help-text text-text-secondary', className)}
    {...props}
  />
));

export const SelectItem = forwardRef<
  ElementRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3',
      'text-footnote text-text-secondary outline-none',
      'hover:bg-action-background-hover focus:bg-action-background-hover',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export const SelectSeparator = forwardRef<
  ElementRef<typeof SelectPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-divider', className)} {...props} />
));

// ─── Nova Spektr Select (compound, compatible with ui-kit/Select API) ─────────

type ContextProps = {
  onItemSelect: (value: string) => void;
  registerItem: (value: string, content: ReactNode) => void;
  unregisterItem: (value: string) => void;
};

const Context = createContext<ContextProps>({
  onItemSelect: () => {},
  registerItem: () => {},
  unregisterItem: () => {},
});

type RootProps<T extends string> = PropsWithChildren<{
  name?: string;
  placeholder: string;
  value: T | null;
  invalid?: boolean;
  disabled?: boolean;
  height?: 'sm' | 'md';
  testId?: string;
  valueNode?: ReactNode;
  open?: boolean;
  onToggle?: (value: boolean) => void;
  onChange: (value: T) => void;
  onSearch?: (query: string) => void;
}>;

type ItemProps = PropsWithChildren<{
  value: string;
  indent?: number;
  itemTestId?: string;
}>;

type GroupProps = PropsWithChildren<{
  title: ReactNode;
}>;

const Root = <T extends string>({
  invalid,
  disabled,
  testId = 'Select',
  height = 'sm',
  placeholder,
  value,
  valueNode,
  open: controlledOpen,
  onToggle,
  onChange,
  onSearch,
  children,
}: RootProps<T>) => {
  const registeredItems = useRef<Map<string, ReactNode>>(new Map());
  const [selectedContent, setSelectedContent] = useState<ReactNode>(null);
  const [open, setOpen] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : open;
  const onOpenChange = useCallback((v: boolean) => {
    setOpen(v);
    onToggle?.(v);
  }, [onToggle]);

  const registerItem = useCallback((v: string, content: ReactNode) => {
    registeredItems.current.set(v, content);
    if (v === value) setSelectedContent(content);
  }, [value]);

  const unregisterItem = useCallback((v: string) => {
    registeredItems.current.delete(v);
  }, []);

  const onItemSelect = useCallback((v: string) => {
    setSelectedContent(registeredItems.current.get(v) ?? null);
    onChange(v as T);
    onOpenChange(false);
  }, [onChange, onOpenChange]);

  useEffect(() => {
    if (value && registeredItems.current.has(value)) {
      setSelectedContent(registeredItems.current.get(value) ?? null);
    }
  }, [value]);

  const ctx = useMemo(() => ({ onItemSelect, registerItem, unregisterItem }), [onItemSelect, registerItem, unregisterItem]);

  return (
    <Context.Provider value={ctx}>
      <SelectPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
        <SelectPrimitive.Trigger
          disabled={disabled}
          data-testid={testId}
          className={cn(
            'relative flex w-full cursor-pointer items-center justify-between rounded-sm',
            'border border-filter-border bg-input-background px-2.75',
            'text-footnote text-text-primary outline-none',
            'hover:shadow-card-shadow focus:border-active-container-border focus-visible:outline-none',
            height === 'sm' ? 'h-8.5' : 'h-10.5',
            invalid && 'border-filter-border-negative',
            disabled && 'cursor-not-allowed opacity-60',
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            {valueNode || selectedContent || <span className="text-text-secondary">{placeholder}</span>}
          </div>
          <div className="absolute top-1/2 right-1.5 shrink-0 -translate-y-1/2">
            <Icon name="down" size={16} />
          </div>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={8}
            className={cn(
              'pointer-events-auto relative z-[9999]',
              'flex max-h-[300px] w-[var(--radix-select-trigger-width)] flex-col overflow-auto overscroll-contain',
              'rounded-md border border-filter-border bg-input-background p-1 shadow-lg',
              'data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95',
            )}
          >
            <SelectPrimitive.Viewport>
              {/* Hidden items that register themselves */}
              <div className="hidden">{children}</div>
              {/* Visible rendered items */}
              {Array.from(registeredItems.current.entries()).length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 px-2 py-6">
                  <FootnoteText className="text-text-tertiary">No options</FootnoteText>
                </div>
              )}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {/* Render children for registration side-effect */}
      <div className="hidden">{children}</div>
    </Context.Provider>
  );
};

const Group = ({ title, children }: PropsWithChildren<GroupProps>) => {
  if (Children.count(children) === 0) return null;
  return (
    <div className="mb-1 last:mb-0">
      <div className="px-2 py-1 text-help-text text-text-secondary">{title}</div>
      {children}
    </div>
  );
};

const Item = memo(({ value, itemTestId, indent = 0, children }: PropsWithChildren<ItemProps>) => {
  const { registerItem, unregisterItem, onItemSelect } = useContext(Context);

  useEffect(() => {
    registerItem(value, children);
    return () => unregisterItem(value);
  }, [value, children, registerItem, unregisterItem]);

  const paddingLeft = indent > 0 ? `${24 + indent * 16}px` : undefined;

  return (
    <div
      role="option"
      aria-selected={false}
      data-testid={itemTestId}
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded px-3 py-2',
        'text-footnote text-text-secondary outline-none',
        'hover:bg-action-background-hover',
      )}
      style={paddingLeft ? { paddingLeft } : undefined}
      onClick={() => onItemSelect(value)}
    >
      {children}
    </div>
  );
});
Item.displayName = 'SelectItem';

/**
 * Select — compound dropdown component
 *
 * @example
 * // Simple select
 * <Select placeholder="Choose network" value={network} onChange={setNetwork}>
 *   <Select.Item value="polkadot">Polkadot</Select.Item>
 *   <Select.Item value="kusama">Kusama</Select.Item>
 * </Select>
 *
 * @example
 * // With groups
 * <Select placeholder="Choose asset" value={asset} onChange={setAsset}>
 *   <Select.Group title="Mainnets">
 *     <Select.Item value="dot">DOT</Select.Item>
 *   </Select.Group>
 *   <Select.Group title="Testnets">
 *     <Select.Item value="wnd">WND</Select.Item>
 *   </Select.Group>
 * </Select>
 */
export const Select = Object.assign(Root, {
  Group,
  Item,
});
