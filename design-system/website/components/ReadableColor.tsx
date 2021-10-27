/** @jsxRuntime classic */
/** @jsx jsx */

import type { ReactNode } from 'react';
import { jsx } from '@keystone-ui/core';
import tinycolor from 'tinycolor2';

const BLACK = '#000';
const WHITE = '#fff';

export const ReadableColor = ({
  background,
  children,
}: {
  background: string;
  children: ReactNode;
}) => {
  const color = tinycolor.isReadable(BLACK, background) ? BLACK : WHITE;
  return <span css={{ color }}>{children}</span>;
};
