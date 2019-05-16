/** @jsx jsx */

import PropTypes from 'prop-types';
import { jsx } from '@emotion/core';

const firstLetter = str =>
  str == null
    ? ''
    : str
        .split(' ')
        .map(s => s.slice(0, 1))
        .join('')
        .toUpperCase();

// TODO: size variants?
const AvatarBase = ({ as: Tag = 'div', ...props }) => (
  <Tag
    css={{
      borderRadius: 70,
      height: 70,
      width: 70,
    }}
    {...props}
  />
);
const AvatarText = ({ initials, ...props }) => (
  <AvatarBase
    css={{
      alignItems: 'center',
      backgroundColor: '#D8D8D8',
      color: 'rgba(0, 0, 0, 0.25)',
      display: 'inline-flex',
      fontSize: '2rem',
      fontWeight: 'bold',
      justifyContent: 'center',
    }}
    {...props}
  >
    {initials}
  </AvatarBase>
);
const AvatarImage = props => <AvatarBase as="img" {...props} />;

export const AvatarStack = ({ users, ...props }) => (
  <div css={{ position: 'relative', width: 70, height: 70 }} {...props}>
    {users.map((user, idx) => (
      <Avatar
        key={user.id}
        alt={`${user.name} Avatar`}
        name={user.name}
        src={user.image && user.image.small}
        css={{
          boxShadow: `0 0 0 4px white`,
          marginLeft: -idx * 10,
          position: 'absolute',
          zIndex: -idx,
        }}
        {...props}
      />
    ))}
  </div>
);

export const Avatar = ({ alt, name, src, ...props }) =>
  src ? (
    <AvatarImage alt={alt} src={src} {...props} />
  ) : (
    <AvatarText initials={firstLetter(name)} {...props} />
  );

Avatar.propTypes = {
  name: PropTypes.string.isRequired,
  src: PropTypes.string,
};
