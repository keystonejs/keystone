/** @jsx jsx */
import { jsx } from '@emotion/core';
import PropTypes from 'prop-types';
import { colors } from '../../theme';

export default function Button({ children, onClick, background, foreground, outline, ...props }) {
  return (
    <button
      onClick={onClick}
      css={{
        borderRadius: 40,
        cursor: 'pointer',
        border: 'none',
        fontWeight: 600,
        padding: '.9rem 2rem',
        background: outline ? 'transparent' : background,
        border: `solid 2px ${outline ? colors.greyLight : 'transparent'}`,
        color: outline ? colors.grey : foreground,
        lineHeight: 1,
        outline: 'none',

        '&:active, &:focus': {
          boxShadow: '0 0 0 4px rgba(0,0,0,0.1)',
        },

        '&:hover': {
          textDecoration: 'underline',
        },
      }}
      {...props}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  background: PropTypes.string,
  foreground: PropTypes.string,
  outline: PropTypes.bool,
};

Button.defaultProps = {
  background: colors.purple,
  foreground: 'white',
  outline: false,
};
