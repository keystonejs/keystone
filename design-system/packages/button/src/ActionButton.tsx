/** @jsx jsx */

import { ComponentType, Fragment, HTMLAttributes, useContext } from 'react';
import { jsx, forwardRefWithAs, VisuallyHidden } from '@keystone-ui/core';
import { IconProps } from '@keystone-ui/icons';
import { ButtonContext } from './context';

export type ActionButtonProps = {
  /** An icon only, where the label is visible exclusively to screen readers. */
  icon?: ComponentType<IconProps>;
  /** An icon or element rendered after the button label. */
  iconAfter?: ComponentType<IconProps>;
  /** An icon or element rendered before the button label. */
  iconBefore?: ComponentType<IconProps>;
  /** The label of the button. */
  label: string;
  /** Apply styles to indicate that the button is selected. */
  isSelected?: boolean;
  /** Provide an alternate type if the button is within a form. */
  type?: 'submit' | 'button' | 'reset';
  /** The weight of the button. */
  weight?: 'bold' | 'light';
} & HTMLAttributes<HTMLButtonElement>;

export const ActionButton = forwardRefWithAs<'button', ActionButtonProps>(
  (
    {
      as: Tag = 'button',
      icon: Icon,
      iconAfter: IconAfter,
      iconBefore: IconBefore,
      label,
      isSelected,
      weight = 'bold',
      ...props
    },
    ref
  ) => {
    const { useButtonStyles, useButtonTokens, defaults } = useContext(ButtonContext);

    const buttonTokens = useButtonTokens({
      size: defaults.size,
      tone: defaults.tone,
      weight: weight,
    });
    const buttonStyles = useButtonStyles({ tokens: buttonTokens });

    if (Tag === 'button') {
      props.type = props.type || 'button';
    }

    const children = Icon ? (
      <Fragment>
        <Icon />
        <VisuallyHidden>{label}</VisuallyHidden>
      </Fragment>
    ) : (
      <Fragment>
        {IconBefore && <IconBefore css={{ marginRight: buttonTokens.iconSpacing }} size="small" />}
        <span>{label}</span>
        {IconAfter && <IconAfter css={{ marginLeft: buttonTokens.iconSpacing }} size="small" />}
      </Fragment>
    );

    return (
      <Tag aria-pressed={isSelected} ref={ref} css={buttonStyles} {...props}>
        {children}
      </Tag>
    );
  }
);
