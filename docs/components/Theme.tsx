/** @jsx jsx */
import { jsx, Global } from '@keystone-ui/core';

import { COLORS, SPACE, TYPE, TYPESCALE } from '../lib/TOKENS';

export function Theme() {
  return (
    <Global
      styles={{
        ':root': {
          ...COLORS,
          ...SPACE,
          ...TYPE,
          ...TYPESCALE,
          '--wrapper-width': '90rem',
        },
      }}
    />
  );
}
