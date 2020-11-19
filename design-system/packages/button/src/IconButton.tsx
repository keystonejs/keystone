/** @jsx jsx */

import { ComponentType, useContext } from 'react';
import { jsx, forwardRefWithAs } from '@keystone-ui/core';
import { IconProps } from '@keystone-ui/icons';

import { SizeKey, WeightKey, ToneKey } from './hooks/button';
import { ButtonContext } from './context';

export const iconButtonShapes = ['round', 'square'] as const;

type IconButtonProps = {
  /** The label of the button, passed to `aria-label`. */
  label: string;
  /** The weight of the button. */
  weight?: WeightKey;
  /** When true, the button will be disabled. */
  isDisabled?: boolean;
  /** The icon to place in the button */
  icon: ComponentType<IconProps>;
  /** The tone that is conveyed by the button. */
  tone?: ToneKey;
  /** Provide an alternate type if the button is within a form. */
  type?: HTMLButtonElement['type'];
  /** The size of the button. */
  size?: SizeKey;
};

export const IconButton = forwardRefWithAs<'button', IconButtonProps>(
  (
    {
      as: Tag = 'button',
      isDisabled = false,
      icon: Icon,
      label,
      // size = 'medium',
      tone = 'active',
      weight = 'bold',
      size,
      ...props
    },
    ref
  ) => {
    const { useButtonStyles, useButtonTokens, defaults } = useContext(ButtonContext);
    const buttonTokens = useButtonTokens({
      size: size || defaults.size,
      tone: tone || defaults.tone,
      weight: weight || defaults.weight,
    });
    const buttonStyles = useButtonStyles({
      isDisabled,
      tokens: buttonTokens,
    });

    if (Tag === 'button') {
      props.type = props.type || 'button';
    }

    // todo - move this to a hook
    // icon button specific styles
    Object.assign(buttonStyles, {
      width: buttonTokens.height,
      height: buttonTokens.height,
      padding: 0, // native <button/> elements have padding by default, we should remove it so icons are centered correctly
      borderRadius: '50%',
    });

    return (
      <Tag
        css={buttonStyles}
        aria-disabled={isDisabled}
        aria-label={label}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        <Icon size="small" />
      </Tag>
    );
  }
);
