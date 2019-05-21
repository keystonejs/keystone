/** @jsx jsx */

import PropTypes from 'prop-types';
import { jsx } from '@emotion/core';

function getInitials(str) {
  if (str == null) return '';
  return str
    .split(' ')
    .map(s => s.slice(0, 1))
    .join('')
    .toUpperCase();
}

const SIZE_MAP = {
  xsmall: 24,
  small: 32,
  medium: 48,
  large: 64,
  xlarge: 72,
};
const FONT_MAP = {
  xsmall: 12,
  small: 14,
  medium: 18,
  large: 24,
  xlarge: 32,
};

const AvatarBase = ({ as: Tag = 'div', size, ...props }) => {
  const sizePx = SIZE_MAP[size];

  return (
    <Tag
      css={{
        borderRadius: sizePx,
        height: sizePx,
        width: sizePx,
      }}
      {...props}
    />
  );
};
const AvatarText = ({ initials, ...props }) => {
  const sizePx = FONT_MAP[props.size];

  return (
    <AvatarBase
      css={{
        alignItems: 'center',
        backgroundColor: '#D8D8D8',
        color: 'rgba(0, 0, 0, 0.25)',
        cursor: 'default',
        display: 'inline-flex',
        fontSize: sizePx,
        fontWeight: 'bold',
        justifyContent: 'center',
      }}
      {...props}
    >
      {initials}
    </AvatarBase>
  );
};
const AvatarImage = props => <AvatarBase as="img" {...props} />;

export const Avatar = ({ alt, name, src, ...props }) =>
  src ? (
    <AvatarImage title={name} alt={alt} src={src} {...props} />
  ) : (
    <AvatarText title={name} initials={getInitials(name)} {...props} />
  );

Avatar.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.oneOf(Object.keys(SIZE_MAP)),
  src: PropTypes.string,
};
Avatar.defaultProps = {
  size: 'medium',
};

// Stack

export const AvatarStack = ({ size, users, ...props }) => {
  const sizePx = SIZE_MAP[size];

  return (
    <div css={{ position: 'relative', width: sizePx, height: sizePx }} {...props}>
      {users.map((user, idx) => (
        <Avatar
          key={user.id}
          alt={`${user.name} Avatar`}
          name={user.name}
          size={size}
          src={user.image && user.image.small}
          css={{
            boxShadow: `0 0 0 4px white`,
            marginLeft: -idx * 10,
            position: 'absolute',
            zIndex: -idx,
          }}
        />
      ))}
    </div>
  );
};
