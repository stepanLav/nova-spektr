/**
 * Slider — shadcn/ui component
 * Replaces: shared/ui-kit/Slider/Slider.tsx
 *
 * API:
 *   - Slider (compound/memo component) with simple and range modes
 *   - Shadcn-style: SliderRoot, SliderTrack, SliderRange, SliderThumb
 */
import * as SliderPrimitive from '@radix-ui/react-slider';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
  forwardRef,
  memo,
  useMemo,
} from 'react';

import { cn } from '../lib/utils';

// ─── Step helpers (inlined from source) ──────────────────────────────────────

const maxIndicationDensity = 20;

const countSteps = (min: number, max: number, stepSize: number): number => {
  const steps = max - min;
  const remainder = stepSize ? steps % stepSize : 0;

  return remainder ? steps : steps / stepSize + 1;
};

// ─── StepIndicators ──────────────────────────────────────────────────────────

const StepIndicators = memo(({ steps }: { steps: number }) => {
  const nodes = useMemo(() => {
    if (steps > maxIndicationDensity) return [];

    return Array.from({ length: steps }).map((_, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <div key={i} className="mx-1.5 h-1 w-1 rounded-full bg-icon-button" />
    ));
  }, [steps]);

  if (nodes.length === 0) return null;

  return <div className="pointer-events-none absolute flex w-full justify-between">{nodes}</div>;
});
StepIndicators.displayName = 'StepIndicators';

// ─── StepLabels ──────────────────────────────────────────────────────────────

const StepLabels = memo(
  ({
    steps,
    renderLabel,
    min,
    stepSize,
  }: {
    steps: number;
    min: number;
    stepSize: number;
    renderLabel?: (value: number, index: number) => ReactNode;
  }) => {
    const nodes = useMemo(() => {
      if (!renderLabel || steps > 10) return [];

      return Array.from({ length: steps }).map((_, i) => {
        const value = min + i * stepSize;

        return (
          <div key={value} className="mx-1 flex h-fit w-2 justify-center">
            {renderLabel(value, i)}
          </div>
        );
      });
    }, [renderLabel, steps, min, stepSize]);

    if (nodes.length === 0) return null;

    return <div className="pointer-events-none flex w-full justify-between px-2">{nodes}</div>;
  },
);
StepLabels.displayName = 'StepLabels';

// ─── Slider ───────────────────────────────────────────────────────────────────

type RangeValue = [start: number, end: number];

type SimpleProps = {
  range?: never;
  value: number;
  onChange: (value: number) => unknown;
};

type RangeProps = {
  range: true;
  value: RangeValue;
  onChange: (value: RangeValue) => void;
};

type SliderProps = (SimpleProps | RangeProps) & {
  renderLabel?: (value: number, index: number) => ReactNode;
  step?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
};

const thumbClassName = cn(
  'relative block h-5 w-5 rounded-full border-2 border-white-button-background-default',
  'bg-primary-button-background-default',
  'hover:bg-primary-button-background-hover',
  'active:bg-primary-button-background-active',
  'focus:ring-2 focus:outline-none',
);

export const Slider = memo(
  forwardRef<HTMLSpanElement, SliderProps>(
    ({ value, min = 0, max = 10, disabled, range, renderLabel, step: stepSize = 1, onChange }, ref) => {
      const fixedValue = range ? value : [value];

      const handleChange = (newValue: number[]) => {
        if (range) {
          onChange(newValue as RangeValue);
        } else {
          (onChange as (v: number) => unknown)(newValue.at(0) ?? 0);
        }
      };

      const isStartFilled = range ? value.at(0) === min : true;
      const isEndFilled = range ? value.at(1) === max : value === max;

      const totalSteps = countSteps(min, max, stepSize);

      return (
        <div className="flex w-full flex-col gap-2">
          <StepLabels min={min} stepSize={stepSize} steps={totalSteps} renderLabel={renderLabel} />

          <div className="relative flex h-4 w-full items-center">
            <div
              className={cn(
                'h-2 w-2 rounded-s',
                isStartFilled ? 'bg-primary-button-background-default' : 'bg-icon-blue-line',
              )}
            />

            <SliderPrimitive.Root
              ref={ref}
              className="relative flex h-full w-full items-center"
              value={fixedValue}
              step={stepSize}
              min={min}
              max={max}
              disabled={disabled}
              minStepsBetweenThumbs={1}
              onValueChange={handleChange}
            >
              <SliderPrimitive.Track className="relative block h-2 w-full bg-icon-blue-line">
                <SliderPrimitive.Range className="absolute block h-full bg-primary-button-background-default ps-2" />
              </SliderPrimitive.Track>

              <StepIndicators steps={totalSteps} />

              {fixedValue.map((_, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <SliderPrimitive.Thumb key={i} className={thumbClassName} />
              ))}
            </SliderPrimitive.Root>

            <div
              className={cn(
                'h-2 w-2 rounded-e',
                isEndFilled ? 'bg-primary-button-background-default' : 'bg-icon-blue-line',
              )}
            />
          </div>
        </div>
      );
    },
  ),
);
(Slider as { displayName?: string }).displayName = 'Slider';

// ─── Shadcn-style primitive exports ──────────────────────────────────────────

export const SliderRoot = forwardRef<
  ElementRef<typeof SliderPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('relative flex w-full touch-none select-none items-center', className)}
    {...props}
  />
));
SliderRoot.displayName = 'SliderRoot';

export const SliderTrack = forwardRef<
  ElementRef<typeof SliderPrimitive.Track>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Track>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Track
    ref={ref}
    className={cn('relative h-2 w-full grow overflow-hidden rounded-full bg-icon-blue-line', className)}
    {...props}
  />
));
SliderTrack.displayName = 'SliderTrack';

export const SliderRange = forwardRef<
  ElementRef<typeof SliderPrimitive.Range>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Range>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Range
    ref={ref}
    className={cn('absolute h-full bg-primary-button-background-default', className)}
    {...props}
  />
));
SliderRange.displayName = 'SliderRange';

export const SliderThumb = forwardRef<
  ElementRef<typeof SliderPrimitive.Thumb>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Thumb>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Thumb
    ref={ref}
    className={cn(
      'block h-5 w-5 rounded-full border-2 border-white-button-background-default',
      'bg-primary-button-background-default ring-offset-background',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
SliderThumb.displayName = 'SliderThumb';
