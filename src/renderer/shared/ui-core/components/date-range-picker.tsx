/**
 * DateRangePicker — shadcn/ui component
 * Replaces: shared/ui-kit/DateRangePicker/DateRangePicker.tsx
 *
 * Preserves existing API:
 *   - value: DateRange | undefined
 *   - placeholder: string
 *   - isDisabled: boolean
 *   - onChange: (range: DateRange | undefined) => void
 *
 * Uses: react-day-picker v9, date-fns, Popover (from this library)
 */
import { format, startOfDay, subMonths, subWeeks, subYears } from 'date-fns';
import { memo } from 'react';
import { type DateRange, DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

import { cn } from '../lib/utils';
import { Popover } from './popover';

export type { DateRange };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatRange = (range: DateRange | undefined): string => {
  if (!range || (!range.from && !range.to)) return '';
  if (range.from && range.to) return `${format(range.from, 'LLL dd')} - ${format(range.to, 'LLL dd')}`;
  if (range.from) return format(range.from, 'LLL dd');

  return '';
};

// ─── Presets ──────────────────────────────────────────────────────────────────

type Preset = {
  label: string;
  getRange: () => DateRange;
};

const presets: Preset[] = [
  {
    label: 'Last week',
    getRange: () => {
      const today = startOfDay(new Date());

      return { from: subWeeks(today, 1), to: today };
    },
  },
  {
    label: 'Last month',
    getRange: () => {
      const today = startOfDay(new Date());

      return { from: subMonths(today, 1), to: today };
    },
  },
  {
    label: 'Last year',
    getRange: () => {
      const today = startOfDay(new Date());

      return { from: subYears(today, 1), to: today };
    },
  },
];

// ─── Calendar icon ────────────────────────────────────────────────────────────

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export interface DateRangePickerProps {
  value?: DateRange;
  placeholder?: string;
  isDisabled?: boolean;
  onChange?: (range: DateRange | undefined) => void;
}

export const DateRangePicker = memo(
  ({ value, placeholder = '', isDisabled = false, onChange }: DateRangePickerProps) => {
    const handleReset = () => onChange?.(undefined);
    const formattedRange = formatRange(value);

    return (
      <Popover side="bottom" align="start">
        <Popover.Trigger>
          <button
            type="button"
            disabled={isDisabled}
            className={cn(
              'flex h-full w-full cursor-pointer items-center gap-2 truncate rounded-sm',
              'border border-filter-border bg-input-background px-3 py-[7px] text-start',
              'outline-none focus:outline-none active:outline-none',
              'disabled:bg-input-background-disabled disabled:text-text-tertiary disabled:cursor-not-allowed',
            )}
          >
            <CalendarIcon />
            <span
              className={cn(
                'w-full truncate text-footnote',
                formattedRange ? 'text-text-primary' : 'text-text-secondary',
              )}
            >
              {formattedRange || placeholder}
            </span>
          </button>
        </Popover.Trigger>

        <Popover.Content>
          <div className="flex flex-col">
            {/* Presets */}
            <div className="flex gap-2 border-b border-filter-border px-3 py-2">
              {presets.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  disabled={isDisabled}
                  className={cn(
                    'inline-flex items-center rounded-full border border-filter-border px-3 py-1',
                    'text-footnote text-text-secondary',
                    'hover:bg-block-background-hover disabled:cursor-not-allowed disabled:opacity-50',
                    'transition-colors',
                  )}
                  onClick={() => onChange?.(preset.getRange())}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Calendar */}
            <DayPicker
              mode="range"
              navLayout="around"
              showOutsideDays
              defaultMonth={value?.from}
              selected={value}
              disabled={isDisabled}
              onSelect={onChange}
              classNames={{
                root: 'p-3',
                months: 'flex flex-col sm:flex-row gap-2',
                month: 'flex flex-col gap-4',
                caption: 'flex justify-center relative items-center',
                caption_label: 'text-footnote font-medium text-text-primary',
                nav: 'flex items-center gap-1',
                button_previous: cn(
                  'absolute left-1 inline-flex h-7 w-7 items-center justify-center rounded-md',
                  'border border-filter-border text-text-secondary',
                  'hover:bg-block-background-hover hover:text-text-primary',
                  'disabled:pointer-events-none disabled:opacity-50',
                ),
                button_next: cn(
                  'absolute right-1 inline-flex h-7 w-7 items-center justify-center rounded-md',
                  'border border-filter-border text-text-secondary',
                  'hover:bg-block-background-hover hover:text-text-primary',
                  'disabled:pointer-events-none disabled:opacity-50',
                ),
                month_grid: 'w-full border-collapse',
                weekdays: 'flex',
                weekday: 'text-text-secondary rounded-md w-9 font-normal text-help-text',
                week: 'flex w-full mt-2',
                day: cn(
                  'relative p-0 text-center text-footnote focus-within:relative focus-within:z-20',
                  'h-9 w-9',
                ),
                day_button: cn(
                  'h-9 w-9 p-0 font-normal rounded-md text-text-primary',
                  'hover:bg-block-background-hover',
                  'aria-selected:opacity-100',
                ),
                range_start: 'rounded-l-md bg-primary-button-background-default',
                range_end: 'rounded-r-md bg-primary-button-background-default',
                selected: cn(
                  '[&>button]:bg-primary-button-background-default',
                  '[&>button]:text-white',
                  '[&>button]:hover:bg-primary-button-background-hover',
                ),
                range_middle: cn(
                  'rounded-none bg-selected-background',
                  '[&>button]:bg-transparent [&>button]:text-text-primary',
                  '[&>button]:hover:bg-block-background-hover',
                ),
                today: '[&>button]:font-bold',
                outside: '[&>button]:text-text-tertiary [&>button]:opacity-50',
                disabled: '[&>button]:text-text-tertiary [&>button]:opacity-50 [&>button]:cursor-not-allowed',
                hidden: 'invisible',
              }}
            />

            {/* Reset */}
            <div className="flex justify-end border-t border-filter-border px-3 py-2">
              <button
                type="button"
                disabled={isDisabled}
                className={cn(
                  'text-footnote text-text-secondary hover:text-text-primary',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'transition-colors',
                )}
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
          </div>
        </Popover.Content>
      </Popover>
    );
  },
);

(DateRangePicker as { displayName?: string }).displayName = 'DateRangePicker';
