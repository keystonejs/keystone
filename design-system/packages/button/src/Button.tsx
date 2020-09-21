/** @jsx jsx */

import { ReactNode, useContext } from 'react';
import { jsx } from '@keystone-ui/core';
import { LoadingDots } from '@keystone-ui/loading';

import { ButtonContext } from './context';
import type { WeightKey, ToneKey, SizeKey } from './hooks/button';

type ButtonProps = {
  /** The Button label content. */
  children: ReactNode;
  /** The tone of the Button. */
  tone?: ToneKey;
  /** The size of the Button. */
  size?: SizeKey;
  /** The weight of the Button. */
  weight?: WeightKey;
  /** Whether the Button should be disabled */
  isDisabled?: boolean;
  /** Whether the Button should be in a loading state */
  isLoading?: boolean;
  /** Whether the Button should display as a block */
  isBlock?: boolean;
  onPress?: () => void;
  type?: 'button' | 'submit';
};

const loadingContainerStyles = {
  left: '50%',
  position: 'absolute',
  transform: 'translateX(-50%)',
} as const;

export const Button = ({
  children,
  isDisabled,
  isLoading,
  size,
  tone,
  weight,
  onPress,
  type = 'button',
  ...otherProps
}: ButtonProps) => {
  const { useButtonStyles, useButtonTokens, defaults } = useContext(ButtonContext);
  const tokens = useButtonTokens({
    tone: tone || defaults.tone,
    size: size || defaults.size,
    weight: weight || defaults.weight,
  });
  const styles = useButtonStyles({
    isDisabled,
    tokens,
  });

  return (
    <button type={type} css={styles} onClick={onPress} {...otherProps}>
      <span css={isLoading ? { opacity: 0 } : null}>{children}</span>
      {isLoading && (
        <span css={loadingContainerStyles}>
          <LoadingDots size={size || defaults.size} label="Button loading indicator" />
        </span>
      )}
    </button>
  );
};
