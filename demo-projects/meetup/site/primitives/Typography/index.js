/** @jsx jsx */

import { jsx } from '@emotion/core';
import { fontSizes } from '../../theme';
import { getBreakpoints } from '../../helpers';

const mq = getBreakpoints();

export const Headline = ({ as = 'h2', size, ...props }) => {
  const TagName = as;
  const asSize = size ? `h${size}` : as;
  const baseStyles = { margin: 0, fontWeight: 600 };
  const fontStyles = {
    h1: {
      fontSize: fontSizes.xxl,
      [mq[1]]: { fontSize: fontSizes.xxxl, lineHeight: 1 },
      lineHeight: 1.15,
    },
    h2: {
      fontSize: fontSizes.xl,
      [mq[1]]: { fontSize: fontSizes.xxl },
      lineHeight: 1.15,
    },
    h3: {
      fontSize: fontSizes.lg,
      [mq[1]]: { fontSize: fontSizes.xl },
      lineHeight: 1.15,
    },
    h4: {
      fontSize: fontSizes.lg,
    },
    h5: {
      fontSize: fontSizes.md,
    },
  };

  return <TagName css={[baseStyles, fontStyles[asSize]]} {...props} />;
};

export const H1 = props => <Headline {...props} as="h1" />;
export const H2 = props => <Headline {...props} as="h2" />;
export const H3 = props => <Headline {...props} as="h3" />;
export const H4 = props => <Headline {...props} as="h4" />;
export const H5 = props => <Headline {...props} as="h5" />;
