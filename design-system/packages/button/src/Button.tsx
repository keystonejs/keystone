/** @jsx jsx */

import { ComponentType, ReactNode, useContext } from 'react';
import { forwardRefWithAs, jsx } from '@keystone-ui/core';
import { IconProps } from '@keystone-ui/icons';
import { LoadingDots } from '@keystone-ui/loading';

import { ButtonContext } from './context';
import type { WeightKey, ToneKey, SizeKey } from './hooks/button';

export type ButtonProps = {
  /** The Button label content. */
  children: ReactNode;
  /** An icon or element rendered after the button label. */
  iconAfter?: ComponentType<IconProps>;
  /** An icon or element rendered before the button label. */
  iconBefore?: ComponentType<IconProps>;
  /** Whether the Button should display as a block */
  isBlock?: boolean;
  /** Whether the Button should be disabled */
  isDisabled?: boolean;
  /** Whether the Button should be in a loading state */
  isLoading?: boolean;
  /** Apply styles to indicate that the button is selected. */
  isSelected?: boolean;
  /** The size of the Button. */
  size?: SizeKey;
  /** The tone of the Button. */
  tone?: ToneKey;
  /** Provide an alternate type if the button is within a form. */
  type?: 'button' | 'reset' | 'submit';
  /** The weight of the Button. */
  weight?: WeightKey;
};

const loadingContainerStyles = {
  left: '50%',
  position: 'absolute',
  transform: 'translateX(-50%)',
} as const;

export const Button = forwardRefWithAs<'button', ButtonProps>(
  (
    {
      as: Tag = 'button',
      children,
      iconAfter: IconAfter,
      iconBefore: IconBefore,
      isDisabled,
      isLoading,
      isSelected,
      size,
      tone,
      type = 'button',
      weight,
      ...otherProps
    },
    ref
  ) => {
    const { useButtonStyles, useButtonTokens, defaults } = useContext(ButtonContext);
    const tokens = useButtonTokens({
      size: size || defaults.size,
      tone: tone || defaults.tone,
      weight: weight || defaults.weight,
    });
    const buttonStyles = useButtonStyles({
      isDisabled,
      isSelected,
      tokens,
    });

    return (
      <Tag
        type={Tag === 'button' ? type : undefined}
        css={buttonStyles}
        aria-pressed={isSelected}
        ref={ref}
        {...otherProps}
      >
        <span css={isLoading ? { opacity: 0 } : null}>
          {IconBefore && <IconBefore css={{ marginRight: tokens.iconSpacing }} size="small" />}
          {children}
          {IconAfter && <IconAfter css={{ marginLeft: tokens.iconSpacing }} size="small" />}
        </span>
        {isLoading && (
          <span css={loadingContainerStyles}>
            <LoadingDots size={size || defaults.size} label="Button loading indicator" />
          </span>
        )}
      </Tag>
    );
  }
);
