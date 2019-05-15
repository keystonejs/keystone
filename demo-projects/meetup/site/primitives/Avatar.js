/** @jsx jsx */

import PropTypes from 'prop-types';
import { jsx } from '@emotion/core';

const firstLetter = str => str == null
  ? ''
  : str.split(' ').map(s => s.slice(0, 1)).join('').toUpperCase();

// TODO: size variants?
const AvatarBase = ({ as: Tag = 'div', ...props }) => (
  <Tag css={{
    borderRadius: 70,
    height: 70,
    width: 70,
  }} {...props} />
);
const AvatarText = ({ initials, ...props }) => (
  <AvatarBase css={{
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    color: 'rgba(0, 0, 0, 0.25)',
    display:'flex',
    fontSize: '2rem',
    fontWeight: 'bold',
    justifyContent: 'center',
  }} {...props}>
    {initials}
  </AvatarBase>
);
const AvatarImage = props => (
  <AvatarBase as="img" {...props} />
);

export const Avatar = ({ name, src, ...props }) => src
	? <AvatarImage src={src} {...props} />
	: <AvatarText initials={firstLetter(name)} {...props} />;

Avatar.propTypes = {
  name: PropTypes.string.isRequired,
  src: PropTypes.string,
};
