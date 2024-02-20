import { PropsWithChildren, ReactNode, ComponentPropsWithoutRef } from 'react';

import { cnTw } from '@shared/lib/utils';
import { ViewClass, SizeClass, Padding } from '../common/constants';
import { Pallet, Variant } from '../common/types';

export type HTMLAnchorProps = 'href' | 'target' | 'className';

type Props = Pick<ComponentPropsWithoutRef<'a'>, HTMLAnchorProps> & {
  variant?: Variant;
  pallet?: Pallet;
  size?: keyof typeof SizeClass;
  disabled?: boolean;
  prefixElement?: ReactNode;
  suffixElement?: ReactNode;
};

export const ButtonWebLink = ({
  href,
  target = '_self',
  variant = 'fill',
  pallet = 'primary',
  size = 'md',
  className,
  disabled,
  children,
  prefixElement,
  suffixElement,
}: PropsWithChildren<Props>) => {
  const classes = cnTw(
    'flex items-center justify-center gap-x-2 font-medium select-none outline-offset-1',
    SizeClass[size],
    variant !== 'text' && Padding[size],
    ViewClass[`${variant}_${pallet}`],
    className,
  );

  const content = (
    <>
      {prefixElement && <div data-testid="prefix">{prefixElement}</div>}
      <div className={cnTw(prefixElement && 'ml-auto', suffixElement && 'ml-0 mr-auto')}>{children}</div>
      {suffixElement && <div data-testid="suffix">{suffixElement}</div>}
    </>
  );

  return disabled ? (
    <div className={classes}>{content}</div>
  ) : (
    <a href={href} className={classes} target={target}>
      {content}
    </a>
  );
};
