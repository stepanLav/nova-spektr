/**
 * Textarea — shadcn/ui component
 * Replaces: shared/ui-kit/TextArea/TextArea.tsx
 *
 * API compatibility: same props as original TextArea
 */
import { type ComponentPropsWithoutRef, forwardRef } from 'react';

import { FootnoteText } from '@/shared/ui/Typography';
import { cn } from '../lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type TextAreaSpecificProps = {
  autosize?: boolean;
  testId?: string;
  invalid?: boolean;
  onChange?: (value: string) => void;
};

type Props = Pick<
  ComponentPropsWithoutRef<'textarea'>,
  'value' | 'disabled' | 'placeholder' | 'name' | 'autoFocus' | 'rows' | 'maxLength' | 'spellCheck' | 'className'
> &
  TextAreaSpecificProps;

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Multi-line text area with optional autosize
 *
 * @example
 * // Simple textarea
 * <Textarea rows={4} value={text} onChange={setText} />
 *
 * @example
 * // Auto-growing (expands with content)
 * <Textarea autosize value={text} onChange={setText} />
 *
 * @example
 * // Invalid state
 * <Textarea invalid value={badText} />
 */
export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ autosize, invalid, disabled, testId = 'Textarea', value, onChange, rows = 3, className, ...props }, ref) => {
    const textareaEl = (
      <textarea
        {...props}
        ref={ref}
        rows={rows}
        value={value}
        disabled={disabled}
        data-testid={testId}
        data-invalid={invalid}
        className={cn(
          'w-full rounded-sm px-3 py-2',
          'resize-none text-footnote text-text-primary',
          'bg-input-background outline-1 outline-filter-border outline-solid placeholder:text-text-secondary',
          !disabled && 'focus-within:outline-active-container-border hover:shadow-card-shadow focus:outline-1',
          disabled && 'bg-input-background-disabled text-text-tertiary placeholder:text-text-tertiary',
          invalid && 'outline-filter-border-negative',
          autosize && 'absolute inset-0',
          className,
        )}
        onChange={(e) => onChange?.(e.target.value)}
      />
    );

    if (autosize) {
      return (
        <div className="relative px-3 py-2 whitespace-pre-wrap" style={{ minHeight: 16 + rows * 18 }}>
          <FootnoteText>{value}&nbsp;</FootnoteText>
          {textareaEl}
        </div>
      );
    }

    return textareaEl;
  },
);

Textarea.displayName = 'Textarea';
