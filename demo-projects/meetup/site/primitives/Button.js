/** @jsx jsx */
import { jsx } from '@emotion/core';
import PropTypes from 'prop-types';
import { colors } from '../theme';
import { Link as NextLink } from '../../routes';
import { getForegroundColor } from '../helpers';

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

const SIZE_MAP = {
  small: '.6rem 1.33rem',
  medium: '.9rem 2rem',
};

export default function Button({ background, outline, size, ...props }) {
  const Tag = getTag(props);
  const foreground = background
    ? getForegroundColor(background)
    : colors.greyDark;

  const padding = SIZE_MAP[size];

  return (
    <Tag
      css={{
        background: outline ? 'transparent' : background,
        border: `solid 2px ${outline ? colors.greyLight : 'transparent'}`,
        borderRadius: 40,
        color: foreground,
        cursor: 'pointer',
        display: 'inline-block',
        fontWeight: 600,
        lineHeight: 1,
        outline: 'none',
        padding: padding,
        textDecoration: 'none',
      }}
      {...props}
    />
  );
}

Button.propTypes = {
  background: PropTypes.string,
  outline: PropTypes.bool,
  size: PropTypes.oneOf(['medium', 'small'])
};

Button.defaultProps = {
  background: colors.purple,
  outline: false,
  size: 'medium'
};
