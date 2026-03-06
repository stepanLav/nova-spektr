/**
 * Combobox — shadcn/ui component
 * Replaces: shared/ui-kit/Combobox/Combobox.tsx (uses @ariakit)
 *
 * Strategy: @radix-ui/react-popover + native <input> + keyboard navigation.
 * No @ariakit dependency.
 *
 * API:
 *   - Combobox compound: Combobox (Root), Combobox.Control, Combobox.Input,
 *     Combobox.Option, Combobox.Group, Combobox.EmptyMessage
 *   - Shadcn-style primitives mirror the compound sub-components.
 */
import * as PopoverPrimitive from '@radix-ui/react-popover';
import {
  type KeyboardEvent,
  type PropsWithChildren,
  type ReactNode,
  Children,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { cn } from '../lib/utils';

// ─── Context ──────────────────────────────────────────────────────────────────

type ContextProps = {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  value: string;
  onSelect: (val: string) => void;
  onSearch: (val: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  registerOption: (val: string) => void;
  unregisterOption: (val: string) => void;
  options: React.MutableRefObject<string[]>;
  testId?: string;
};

const Context = createContext<ContextProps>({
  open: false,
  onOpenChange: () => {},
  value: '',
  onSelect: () => {},
  onSearch: () => {},
  inputRef: { current: null },
  activeIndex: -1,
  setActiveIndex: () => {},
  registerOption: () => {},
  unregisterOption: () => {},
  options: { current: [] },
});

// ─── Root ─────────────────────────────────────────────────────────────────────

type RootProps = PropsWithChildren<{
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  open?: boolean;
  onOpenChange?: (val: boolean) => void;
  testId?: string;
  disabled?: boolean;
  placeholder?: string;
}>;

const Root = ({
  value,
  onChange,
  onSearch,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  testId = 'Combobox',
  children,
}: RootProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const options = useRef<string[]>([]);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = useCallback(
    (val: boolean) => {
      if (!isControlled) setInternalOpen(val);
      controlledOnOpenChange?.(val);
    },
    [isControlled, controlledOnOpenChange],
  );

  const onSelect = useCallback(
    (val: string) => {
      onChange(val);
      onOpenChange(false);
      inputRef.current?.blur();
    },
    [onChange, onOpenChange],
  );

  const handleSearch = useCallback(
    (val: string) => {
      onSearch?.(val);
    },
    [onSearch],
  );

  const registerOption = useCallback((val: string) => {
    if (!options.current.includes(val)) {
      options.current = [...options.current, val];
    }
  }, []);

  const unregisterOption = useCallback((val: string) => {
    options.current = options.current.filter(v => v !== val);
  }, []);

  const ctx = useMemo(
    () => ({
      open,
      onOpenChange,
      value,
      onSelect,
      onSearch: handleSearch,
      inputRef,
      activeIndex,
      setActiveIndex,
      registerOption,
      unregisterOption,
      options,
      testId,
    }),
    [open, onOpenChange, value, onSelect, handleSearch, activeIndex, registerOption, unregisterOption, testId],
  );

  return (
    <Context.Provider value={ctx}>
      <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <div className="w-full">{children}</div>
      </PopoverPrimitive.Root>
    </Context.Provider>
  );
};

// ─── Control ─────────────────────────────────────────────────────────────────

/**
 * Wraps the trigger area (anchor for popover positioning).
 */
const Control = ({ children }: PropsWithChildren) => {
  return <PopoverPrimitive.Anchor asChild><div className="w-full">{children}</div></PopoverPrimitive.Anchor>;
};

// ─── Input ────────────────────────────────────────────────────────────────────

type ComboboxInputProps = {
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  invalid?: boolean;
};

const ComboboxInput = ({ placeholder, disabled, className, invalid }: ComboboxInputProps) => {
  const { value, onSelect, onOpenChange, onSearch, inputRef, activeIndex, setActiveIndex, options } =
    useContext(Context);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const opts = options.current;
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setActiveIndex(Math.min(activeIndex + 1, opts.length - 1));
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setActiveIndex(Math.max(activeIndex - 1, 0));
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (activeIndex >= 0 && opts[activeIndex]) {
          onSelect(opts[activeIndex]);
        }
        break;
      }
      case 'Escape': {
        onOpenChange(false);
        break;
      }
      default:
        break;
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      role="combobox"
      aria-expanded={true}
      aria-autocomplete="list"
      autoComplete="off"
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1',
        'text-footnote text-text-primary placeholder:text-text-secondary',
        'focus:outline-none focus:ring-1 focus:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        { 'border-alert': invalid },
        className,
      )}
      onChange={e => {
        onSearch(e.target.value);
        onOpenChange(true);
        setActiveIndex(-1);
      }}
      onFocus={() => onOpenChange(true)}
      onBlur={() => {
        // Small delay to allow click on option
        setTimeout(() => onOpenChange(false), 150);
      }}
      onKeyDown={handleKeyDown}
    />
  );
};

// ─── Option ───────────────────────────────────────────────────────────────────

type OptionProps = PropsWithChildren<{
  value: string;
  className?: string;
}>;

const Option = ({ value, children, className }: OptionProps) => {
  const { onSelect, activeIndex, setActiveIndex, registerOption, unregisterOption, options } = useContext(Context);

  const index = options.current.indexOf(value);
  const isActive = index === activeIndex;

  useEffect(() => {
    registerOption(value);
    return () => unregisterOption(value);
  }, [value, registerOption, unregisterOption]);

  return (
    <div
      role="option"
      aria-selected={isActive}
      data-active={isActive}
      className={cn(
        'flex cursor-pointer rounded-sm px-3 py-2 text-footnote text-text-secondary',
        'bg-block-background-default',
        'mb-1 last:mb-0',
        { 'bg-block-background-hover': isActive },
        className,
      )}
      onMouseEnter={() => setActiveIndex(index)}
      onMouseDown={e => {
        e.preventDefault(); // keep focus on input
        onSelect(value);
      }}
    >
      {children}
    </div>
  );
};

// ─── Group ────────────────────────────────────────────────────────────────────

type GroupProps = PropsWithChildren<{ title: ReactNode }>;

const ComboboxGroup = ({ title, children }: GroupProps) => {
  if (Children.count(children) === 0) return null;

  return (
    <div className="mb-1 last:mb-0" role="group">
      <div className="mb-1 px-3 py-1 text-help-text text-text-secondary">{title}</div>
      {children}
    </div>
  );
};

// ─── EmptyMessage ─────────────────────────────────────────────────────────────

const EmptyMessage = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex items-center justify-center px-3 py-4 text-footnote text-text-secondary">
      {children}
    </div>
  );
};

// ─── Content (internal popover) ───────────────────────────────────────────────

type ContentProps = PropsWithChildren<{ className?: string }>;

const ComboboxContent = ({ children, className }: ContentProps) => {
  const { testId, inputRef } = useContext(Context);

  if (Children.count(children) === 0) return null;

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        asChild
        hideWhenDetached
        data-testid={testId}
        sideOffset={8}
        collisionPadding={8}
        onOpenAutoFocus={e => e.preventDefault()}
        onInteractOutside={e => {
          if (e.target === inputRef.current) {
            e.preventDefault();
          }
        }}
        style={{ width: 'var(--radix-popover-trigger-width)' }}
      >
        <div
          className={cn(
            'z-50 flex h-max flex-col p-1',
            'max-h-(--radix-popper-available-height) overflow-hidden overflow-y-auto',
            'rounded-md border border-token-container-border bg-block-background-default shadow-shadow-2',
            'origin-(--radix-popper-transform-origin) duration-100 animate-in fade-in zoom-in-95',
            className,
          )}
          role="listbox"
        >
          {children}
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
};

// ─── Compound export ──────────────────────────────────────────────────────────

export const Combobox = Object.assign(Root, {
  Control,
  Input: ComboboxInput,
  Option,
  Group: ComboboxGroup,
  EmptyMessage,
  Content: ComboboxContent,
});
