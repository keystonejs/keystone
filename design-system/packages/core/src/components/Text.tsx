/** @jsx jsx */

import { jsx } from '../emotion';

import { Box, BoxProps } from './Box';
import { Theme } from '../types';
import { forwardRefWithAs } from '../utils';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useTheme } from '../theme';

type TextProps = {
  /** The leading of the text. */
  leading?: keyof Theme['typography']['leading'];
  /** The size of the text. */
  size?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';
  /** The tracking of the text. */
  tracking?: keyof Theme['typography']['tracking'];
  /** The color of the text. */
  color?: keyof Theme['palette'];
  /** The font-weight of the text. */
  weight?: keyof Theme['typography']['fontWeight'];
} & BoxProps;

export const Text = forwardRefWithAs<'div', TextProps>(
  (
    { color, leading = 'base', size = 'medium', tracking = 'base', weight = 'regular', ...props },
    ref
  ) => {
    const { palette, typography } = useTheme();

    const { mq } = useMediaQuery();

    const styles = mq({
      color: color ? palette[color] : undefined,
      fontSize: typography.fontSize[size],
      fontWeight: typography.fontWeight[weight],
      letterSpacing: typography.tracking[tracking],
      lineHeight: typography.leading[leading],
    });

    return <Box css={styles} ref={ref} {...props} />;
  }
);
