/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';

import { colors, gridSize } from '@arch-ui/theme';

const truncate = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const SubtleText = styled.span({
  color: colors.N60,
});

export const H1 = styled.h1({
  fontSize: 28,
  fontWeight: 300,
  margin: '24px 0',
});
export const PageTitle = styled.h1({
  fontSize: '2.4rem',
  fontWeight: 900,
  marginBottom: '0.5em',
  marginTop: '1.0rem',
});

export const Truncate = ({ as: Tag = 'div', ...props }) => <Tag css={truncate} {...props} />;

export const Title = ({ as: Tag = 'h3', crop = false, margin = 'none', ...props }) => {
  const gutter = gridSize * 3;
  const margins = {
    none: { margin: 0 },
    both: { marginBottom: gutter, marginTop: gutter },
    bottom: { marginBottom: gutter, marginTop: 0 },
    top: { marginBottom: 0, marginTop: gutter },
  };
  const offset = margins[margin];
  const cropStyles = crop ? truncate : null;

  return (
    <Tag
      css={{
        fontSize: 18,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        ...cropStyles,
        ...offset,
      }}
      {...props}
    />
  );
};

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

export const A11yText = ({ tag: Tag = 'span', ...props }) => (
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
