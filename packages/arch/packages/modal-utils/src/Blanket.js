import styled from '@emotion/styled';

import { colors } from '../theme';
import { alpha } from '../color-utils';

export const Blanket = styled.div(({ isTinted, isLight }) => {
  let bg = 'transparent';
  if (isTinted) {
    bg = isLight ? 'rgba(250, 251, 252, 0.66)' : alpha(colors.N90, 0.66);
  }
  return {
    backgroundColor: bg,
    bottom: 0,
    left: 0,
    position: 'fixed',
    right: 0,
    top: 0,
    zIndex: 2,
  };
});
