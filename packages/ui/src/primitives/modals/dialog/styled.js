import styled from 'react-emotion';

import { colors } from '../../../theme';
import { alpha } from '../../../theme/color-utils';

const outerGutter = 40;
const innerGutter = 20;

// Layout

export const Blanket = styled.div({
  backgroundColor: alpha(colors.N90, 0.66),
  bottom: 0,
  left: 0,
  position: 'fixed',
  right: 0,
  top: 0,
  zIndex: 2,
});
export const Positioner = styled.div(({ width }) => ({
  display: 'flex',
  flexDirection: 'column',
  left: 0,
  marginLeft: 'auto',
  marginRight: 'auto',
  maxHeight: `calc(100% - ${outerGutter * 2}px)`,
  maxWidth: width,
  position: 'fixed',
  right: 0,
  top: outerGutter,
  zIndex: 2,
}));
export const Dialog = styled.div({
  backgroundColor: 'white',
  borderRadius: 5,
  boxShadow: '0 2px 8px -1px rgba(0,0,0,0.3)',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  maxHeight: '100%',
});

// Content

const HeadFoot = styled.div({
  lineHeight: 1,
  margin: `0 ${innerGutter}px`,
  paddingBottom: innerGutter,
  paddingTop: innerGutter,
});
export const Header = styled(HeadFoot)({
  boxShadow: `0 2px 0 ${alpha(colors.text, 0.12)}`,
});
export const Footer = styled(HeadFoot)({
  boxShadow: `0 -2px 0 ${alpha(colors.text, 0.12)}`,
});
export const Title = styled.h3({
  fontSize: 18,
  fontWeight: 500,
  margin: 0,
});
export const Body = styled.div({
  lineHeight: 1.4,
  overflowY: 'auto',
  padding: innerGutter,
});
