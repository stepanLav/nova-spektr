/**
 * Shadcn-compatible cn() utility
 * Uses the same underlying twMerge as cnTw for consistency
 */
// eslint-disable-next-line no-restricted-imports
import classNames from 'classnames';
import { extendTailwindMerge } from 'tailwind-merge';

import additionalColors from '../../../../../tw-config-consts/colors';
import fontSizes from '../../../../../tw-config-consts/font-sizes';

const fonts = Object.keys(fontSizes as Record<string, unknown>);
const colors = Object.keys(additionalColors as Record<string, unknown>);

const twMerge = extendTailwindMerge({
  cacheSize: 10_000,
  extend: {
    classGroups: {
      w: [{ w: ['90', '92', 'modal', 'modal-sm', 'modal-xl'] }],
      h: [{ h: ['modal'] }],
      'font-size': [{ text: fonts }],
      'font-weight': [{ text: fonts }],
      leading: [{ text: fonts }],
      tracking: [{ text: fonts }],
      'bg-color': [{ bg: colors }],
      'text-color': [{ text: colors }],
      'border-color': [{ border: colors }],
    },
  },
});

/**
 * Shadcn-style cn() — identical to cnTw, provided as alias for shadcn components
 */
export function cn(...inputs: Parameters<typeof classNames>): string {
  return twMerge(classNames(inputs));
}
