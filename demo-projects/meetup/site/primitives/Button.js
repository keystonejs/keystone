/** @jsx jsx */
import { jsx } from '@emotion/core';
import PropTypes from 'prop-types';
import { colors } from '../theme';
import { Link as NextLink } from '../../routes';

const Link = ({ route, ...props }) => (
  <NextLink route={route} passHref>
    <a {...props} />
  </NextLink>
);

const getTag = props => {
  let tag = 'button';
  if (props.href) tag = 'a';
  if (props.route) tag = Link;

  return tag;
};

export default function Button({ background, foreground, outline, ...props }) {
  const Tag = getTag(props);

  return (
    <Tag
      css={{
        background: outline ? 'transparent' : background,
        border: `solid 2px ${outline ? colors.greyLight : 'transparent'}`,
        borderRadius: 40,
        color: outline ? colors.grey : foreground,
        cursor: 'pointer',
        display: 'inline-block',
        fontWeight: 600,
        lineHeight: 1,
        outline: 'none',
        padding: '.9rem 2rem',
        textDecoration: 'none',

        '&:active, &:focus': {
          boxShadow: '0 0 0 4px rgba(0,0,0,0.1)',
        },

        '&:hover': {
          textDecoration: 'underline',
        },
      }}
      {...props}
    />
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
