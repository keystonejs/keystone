/** @jsx jsx */
import { jsx } from '@emotion/core';
import { colors } from '../../theme';

export default function Button({ children, onClick, color = colors.yellow, ...props }) {
  return (
    <button
      onClick={onClick}
      css={{
        borderRadius: 40,
        border: 'none',
        fontWeight: 600,
        padding: '.9rem 2rem',
        backgroundColor: color,
        color: color === colors.yellow ? colors.greyDark : 'white',
        lineHeight: 1,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
