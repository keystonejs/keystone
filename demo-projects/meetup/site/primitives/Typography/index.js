/** @jsx jsx */

import PropTypes from 'prop-types';
import { jsx } from '@emotion/core';
import { fontSizes } from '../../theme';

const baseStyles = { margin: 0, fontWeight: 600 };
const sizeMap = [
  {
    fontSize: fontSizes.xxxl,
    lineHeight: 1,
  },
  {
    fontSize: fontSizes.xxl,
    lineHeight: 1.15,
  },
  {
    fontSize: fontSizes.xl,
    lineHeight: 1.15,
  },
  {
    fontSize: fontSizes.lg,
  },
  {
    fontSize: fontSizes.md,
  },
];

export const Headline = ({ as: Tag, size, ...props }) => {
  const fontStyle = sizeMap[size - 1]
    ? sizeMap[size - 1]
    : sizeMap[1];

  return <Tag css={[baseStyles, fontStyle]} {...props} />;
};

export const H1 = props => <Headline as="h1" size={1} {...props} />;
export const H2 = props => <Headline as="h2" size={2} {...props} />;
export const H3 = props => <Headline as="h3" size={3} {...props} />;
export const H4 = props => <Headline as="h4" size={4} {...props} />;
export const H5 = props => <Headline as="h5" size={5} {...props} />;

Headline.propTypes = {
  as: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
};
Headline.defaultProps = {
  as: 'h2',
};
