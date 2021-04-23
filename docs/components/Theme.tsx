/** @jsx jsx */
import { jsx, Global } from '@keystone-ui/core';

import { COLORS, SPACE, TYPE } from '../lib/TOKENS';

export function Theme() {
  return (
    <Global
      styles={{
        ':root': {
          ...COLORS,
          ...SPACE,
          ...TYPE,
          '--wrapper-width': '67rem',
        },
      }}
    />
  );
}
