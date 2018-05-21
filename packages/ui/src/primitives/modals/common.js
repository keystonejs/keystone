import styled from 'react-emotion';

import { colors } from '../../theme';
import { alpha } from '../../theme/color-utils';

export const Blanket = styled.div(({ isTinted }) => ({
  backgroundColor: isTinted ? alpha(colors.N90, 0.66) : 'transparent',
  bottom: 0,
  left: 0,
  position: 'fixed',
  right: 0,
  top: 0,
  zIndex: 2,
}));
