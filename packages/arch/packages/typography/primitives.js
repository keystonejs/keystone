/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';

import { colors } from '../theme';

export const SubtleText = styled.span({
  color: colors.N60,
});

export const H1 = styled.h1({
  fontSize: 28,
  fontWeight: 300,
  margin: '24px 0',
});

export const Kbd = styled.kbd({
  backgroundColor: colors.N05,
  border: `1px solid ${colors.N20}`,
  borderRadius: 3,
  boxShadow: '0 1px 1px rgba(0, 0, 0, 0.12), 0 2px 0 0 rgba(255, 255, 255, 0.7) inset',
  display: 'inline-block',
  fontFamily: 'Monaco, monospace',
  fontSize: '0.85em',
  fontWeight: 'bold',
  lineHeight: 'inherit',
  padding: '1px 5px',
  position: 'relative',
  top: '-1px',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
});

export const A11yText = ({ tag: Tag, ...props }) => (
  <Tag
    css={{
      border: 0,
      clip: 'rect(1px, 1px, 1px, 1px)',
      height: 1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      whiteSpace: 'nowrap',
      width: 1,
    }}
    {...props}
  />
);
A11yText.defaultProps = {
  tag: 'span',
};
