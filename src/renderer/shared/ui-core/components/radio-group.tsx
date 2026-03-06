/**
 * RadioGroup — shadcn/ui component
 * Replaces: shared/ui-kit/RadioGroup/RadioGroup.tsx
 *
 * API compatibility: same compound component API (RadioGroup.Option, RadioGroup.CardOption)
 * Enhancement: CVA-based styling, cleaner code without CSS file dependency
 */
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { type ComponentPropsWithoutRef, type ElementRef, type PropsWithChildren, createContext, forwardRef, useContext, useMemo } from 'react';

import { BodyText, HeaderTitleText, LabelText, SmallTitleText } from '@/shared/ui/Typography';
import { cn } from '../lib/utils';

// ─── Shadcn-style base exports (for direct use) ───────────────────────────────

export const RadioGroupRoot = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Root>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root className={cn('grid gap-2', className)} {...props} ref={ref} />
));
RadioGroupRoot.displayName = RadioGroupPrimitive.Root.displayName;

export const RadioGroupItem = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Item>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      'aspect-square h-4 w-4 rounded-full border border-primary text-primary',
      'ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <div className="h-2.5 w-2.5 rounded-full bg-current" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

// ─── Nova Spektr RadioGroup (compatible API) ──────────────────────────────────

type RadioOption<T = string> = {
  id: string;
  value: T;
  title?: string;
  description?: string;
};

type ContextProps = {
  name?: string;
  disabled?: boolean;
  testId?: string;
};

const Context = createContext<ContextProps>({});

type RootProps<T> = {
  name?: string;
  value?: string;
  disabled?: boolean;
  testId?: string;
  className?: string;
  label?: string;
  onChange?: (value: T) => void;
};

const Root = <T extends string>({
  name,
  value,
  disabled,
  testId = 'RadioGroup',
  className,
  children,
  label,
  onChange,
}: PropsWithChildren<RootProps<T>>) => {
  const ctx = useMemo(() => ({ name, disabled, testId }), [name, disabled, testId]);

  const radioElement = (
    <RadioGroupPrimitive.Root
      name={name}
      value={value}
      disabled={disabled}
      className={cn('flex w-full flex-col', className)}
      data-testid={testId}
      onValueChange={onChange}
    >
      {children}
    </RadioGroupPrimitive.Root>
  );

  return (
    <Context.Provider value={ctx}>
      {label ? (
        <div className="flex w-full flex-col gap-y-2">
          <LabelText className="text-text-tertiary">{label}</LabelText>
          {radioElement}
        </div>
      ) : (
        radioElement
      )}
    </Context.Provider>
  );
};

type CardOptionProps<T = string> = {
  option: RadioOption<T>;
  className?: string;
  testId?: string;
};

/**
 * Card-style radio option (full card is clickable)
 */
const CardOption = <T extends string>({ option, testId, children }: PropsWithChildren<CardOptionProps<T>>) => {
  const { disabled } = useContext(Context);
  const { value, title, description } = option;

  return (
    <RadioGroupPrimitive.Item
      value={String(value)}
      disabled={disabled}
      className="flex disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div
        data-testid={testId}
        className="flex-1 cursor-pointer rounded-sm border border-filter-border p-6 data-[state=checked]:border-active-container-border"
      >
        {children ?? (
          <>
            <div className="flex items-center justify-between">
              {title && (
                <HeaderTitleText as="p" className="mb-2 text-tab-text-accent">
                  {title}
                </HeaderTitleText>
              )}
              <RadioButton />
            </div>
            {description && <BodyText className="text-text-secondary">{description}</BodyText>}
          </>
        )}
      </div>
    </RadioGroupPrimitive.Item>
  );
};

type OptionProps<T = string> = {
  option: RadioOption<T>;
};

/**
 * Standard row-style radio option
 */
const Option = <T extends string>({ option, children }: PropsWithChildren<OptionProps<T>>) => {
  const { disabled } = useContext(Context);
  const { value, title } = option;

  return (
    <RadioGroupPrimitive.Item
      value={String(value)}
      disabled={disabled}
      className="group mb-2 last:mb-0 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="w-full cursor-pointer rounded-sm border border-filter-border group-data-[state=checked]:border-active-container-border">
        <div className="flex cursor-pointer items-center justify-between p-3 transition group-data-[state=checked]:bg-hover group-data-[state=unchecked]:bg-tab-background hover:bg-hover focus:bg-hover">
          <SmallTitleText as="p" className="text-button-large group-data-[state=checked]:text-action-text">
            {title}
          </SmallTitleText>
          <RadioButton />
        </div>
        {children && <div className="p-3">{children}</div>}
      </div>
    </RadioGroupPrimitive.Item>
  );
};

/**
 * Standalone radio button indicator (for custom layouts)
 */
const RadioButton = () => (
  <span className="relative h-4 w-4 rounded-full border border-filter-border bg-card-background group-data-[state=checked]:border-0 group-data-[state=checked]:bg-primary-button-background-default" />
);

/**
 * RadioGroup — compound component for radio button groups
 *
 * @example
 * // Simple group
 * <RadioGroup value={selected} onChange={setSelected}>
 *   <RadioGroup.Option option={{ id: '1', value: 'a', title: 'Option A' }} />
 *   <RadioGroup.Option option={{ id: '2', value: 'b', title: 'Option B' }} />
 * </RadioGroup>
 *
 * @example
 * // Card-style options
 * <RadioGroup value={plan} onChange={setPlan}>
 *   <RadioGroup.CardOption option={{ id: '1', value: 'free', title: 'Free' }} />
 *   <RadioGroup.CardOption option={{ id: '2', value: 'pro', title: 'Pro' }} />
 * </RadioGroup>
 */
export const RadioGroup = Object.assign(Root, {
  CardOption,
  Option,
  RadioButton,
});
