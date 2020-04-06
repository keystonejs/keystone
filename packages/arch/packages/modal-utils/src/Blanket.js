/** @jsx jsx */

import { jsx } from '@emotion/core';

import { colors } from '@arch-ui/theme';
import { alpha } from '@arch-ui/color-utils';

export const Blanket = ({ isTinted, isLight, ...props }) => {
  let bg = 'transparent';

  if (isTinted) {
    bg = isLight ? 'rgba(255, 255, 255, 0.5)' : alpha(colors.N100, 0.2);
  }

  return (
    <div
      css={{
        backgroundColor: bg,
        bottom: 0,
        left: 0,
        position: 'fixed',
        right: 0,
        top: 0,
        zIndex: 2,
      }}
      {...props}
    />
  );
};
