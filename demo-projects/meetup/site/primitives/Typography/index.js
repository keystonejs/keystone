/** @jsx jsx */

import { jsx } from '@emotion/core';
import { fontSizes } from '../../theme';

export function H1({ children, ...props }) {
  return (
    <h1 css={{ fontSize: fontSizes.xxxl, fontWeight: 600, lineHeight: 1, margin: 0 }} {...props}>
      {children}
    </h1>
  );
}

export function H2({ children, ...props }) {
  return (
    <h2 css={{ fontSize: fontSizes.xxl, fontWeight: 600, lineHeight: 1.15, margin: 0 }} {...props}>
      {children}
    </h2>
  );
}

export function H3({ children, ...props }) {
  return (
    <h3 css={{ fontSize: fontSizes.xl, fontWeight: 600, lineHeight: 1.15, margin: 0 }} {...props}>
      {children}
    </h3>
  );
}

export function Headline({ children, as = 'h2', size = 2, ...props }) {
  const TagName = as;
  const baseStyles = { margin: 0, fontWeight: 600 };
  const fontStyles = {
    '1': {
      fontSize: fontSizes.xxxl,
      lineHeight: 1,
    },
    '2': {
      fontSize: fontSizes.xxl,
      lineHeight: 1.15,
    },
    '3': {
      fontSize: fontSizes.xl,
      lineHeight: 1.25,
    },
    '4': {
      fontSize: fontSizes.lg,
    },
    '5': {
      fontSize: fontSizes.md,
    },
  };

  return (
    <TagName css={[baseStyles, fontStyles[size]]} {...props}>
      {children}
    </TagName>
  );
}
