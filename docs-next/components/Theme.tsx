/** @jsx jsx */
import { jsx, Global } from '@keystone-ui/core';

import { COLORS } from '../lib/COLORS';

export function Theme() {
  return (
    <Global
      styles={{
        ':root': COLORS,
      }}
    />
  );
}
