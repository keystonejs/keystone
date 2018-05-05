import React from 'react';
import styled from 'react-emotion';

import { colors } from '../theme';

export const SubtleText = styled.span({
  color: colors.N60,
});

export const Title = styled.div({
  fontSize: 28,
  fontWeight: 300,
  margin: '24px 0',
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
