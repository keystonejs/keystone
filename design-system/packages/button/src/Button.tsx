/** @jsx jsx */

import { ReactNode, useContext } from 'react';
import { forwardRefWithAs, jsx } from '@keystone-ui/core';
import { LoadingDots } from '@keystone-ui/loading';

import { ButtonContext } from './context';
import type { WeightKey, ToneKey, SizeKey } from './hooks/button';

type ButtonProps = {
  /** The Button label content. */
  children: ReactNode;
  /** Whether the Button should display as a block */
  isBlock?: boolean;
  /** Whether the Button should be disabled */
  isDisabled?: boolean;
  /** Whether the Button should be in a loading state */
  isLoading?: boolean;
  /** The size of the Button. */
  size?: SizeKey;
  /** The tone of the Button. */
  tone?: ToneKey;
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
    { as: Tag = 'button', children, isDisabled, isLoading, size, tone, weight, ...otherProps },
    ref
  ) => {
    const { useButtonStyles, useButtonTokens, defaults } = useContext(ButtonContext);
    const tokens = useButtonTokens({
      size: size || defaults.size,
      tone: tone || defaults.tone,
      weight: weight || defaults.weight,
    });
    const styles = useButtonStyles({
      isDisabled,
      tokens,
    });

    return (
      <Tag type={Tag === 'button' ? 'button' : undefined} css={styles} ref={ref} {...otherProps}>
        <span css={isLoading ? { opacity: 0 } : null}>{children}</span>
        {isLoading && (
          <span css={loadingContainerStyles}>
            <LoadingDots size={size || defaults.size} label="Button loading indicator" />
          </span>
        )}
      </Tag>
    );
  }
);
