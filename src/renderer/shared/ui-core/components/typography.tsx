/**
 * Typography — unified CVA-based text component
 * Replaces: shared/ui/Typography/* (10 separate components)
 *
 * All existing named components preserved as backward-compatible aliases.
 *
 * API compatibility:
 *   - All 10 existing text components re-exported with same API
 *   - New: <Text variant="headline" /> unified component
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { type ElementType, type HTMLAttributes, type PropsWithChildren } from 'react';

import { cn } from '../lib/utils';

// ─── CVA Text variants ────────────────────────────────────────────────────────

export const textVariants = cva('', {
  variants: {
    variant: {
      'large-title': 'text-large-title',
      title: 'text-title',
      'header-title': 'text-header-title',
      'medium-title': 'text-medium-title',
      'small-title': 'text-small-title',
      headline: 'text-headline',
      body: 'text-body',
      footnote: 'text-footnote',
      caption: 'text-caption',
      'button-large': 'text-button-large',
      'button-small': 'text-button-small',
      'help-text': 'text-help-text',
      label: 'text-footnote',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    align: 'left',
  },
});

// ─── Base Text component ──────────────────────────────────────────────────────

type TextProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof textVariants> & {
    as?: ElementType;
    className?: string;
  };

/**
 * Unified Text component
 *
 * @example
 * <Text variant="headline">Transaction Details</Text>
 * <Text variant="footnote" align="center">0x1234...5678</Text>
 * <Text as="h2" variant="title">Wallets</Text>
 */
export const Text = ({ as: Tag = 'span', variant, align, className, children, ...props }: PropsWithChildren<TextProps>) => (
  <Tag className={cn(textVariants({ variant, align }), className)} {...props}>
    {children}
  </Tag>
);

// ─── Named aliases (backward compatibility) ───────────────────────────────────
// These preserve 100% API compatibility with shared/ui/Typography components

type TypographyProps = Omit<TextProps, 'variant'>;

/** Extra bold, 26px — page titles */
export const LargeTitleText = (props: PropsWithChildren<TypographyProps>) => (
  <Text variant="large-title" as="h1" {...props} />
);

/** Extra bold, 22px — section titles */
export const TitleText = (props: PropsWithChildren<TypographyProps>) => (
  <Text variant="title" as="h2" {...props} />
);

/** Extra bold, 17px — modal/panel headers */
export const HeaderTitleText = (props: PropsWithChildren<TypographyProps & { as?: ElementType }>) => (
  <Text variant="header-title" as="h3" {...props} />
);

/** Extra bold, 17px */
export const MediumTitleText = (props: PropsWithChildren<TypographyProps>) => (
  <Text variant="medium-title" as="h4" {...props} />
);

/** Extra bold, 14px — card/item titles */
export const SmallTitleText = (props: PropsWithChildren<TypographyProps & { as?: ElementType }>) => (
  <Text variant="small-title" as="h5" {...props} />
);

/** Semi-bold, 15px — subtitles, important labels */
export const HeadlineText = (props: PropsWithChildren<TypographyProps & { as?: ElementType }>) => (
  <Text variant="headline" as="p" {...props} />
);

/** Medium, 13px — main body text */
export const BodyText = (props: PropsWithChildren<TypographyProps & { as?: ElementType }>) => (
  <Text variant="body" as="p" {...props} />
);

/** Medium, 12px — secondary info, descriptions */
export const FootnoteText = (props: PropsWithChildren<TypographyProps & { as?: ElementType }>) => (
  <Text variant="footnote" as="p" {...props} />
);

/** Semi-bold, 10px — ALL CAPS labels, status badges */
export const CaptionText = (props: PropsWithChildren<TypographyProps & { as?: ElementType }>) => (
  <Text variant="caption" as="span" {...props} />
);

/** Medium, 12px — form labels */
export const LabelText = (props: PropsWithChildren<TypographyProps & { as?: ElementType }>) => (
  <Text variant="label" as="span" {...props} />
);

/** Medium, 10px — hints, helper text */
export const HelpText = (props: PropsWithChildren<TypographyProps>) => (
  <Text variant="help-text" as="span" {...props} />
);
