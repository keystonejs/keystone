/** @jsx jsx */

import PropTypes from 'prop-types';
import { jsx } from '@emotion/core';
import { fontSizes } from '../theme';
import { mq } from '../helpers/media';

const SIZE_MAP = [
  fontSizes.xxxl,
  fontSizes.xl,
  fontSizes.lg,
  fontSizes.md,
  fontSizes.sm,
  fontSizes.xs,
];
const baseStyles = {
  fontWeight: 600,
  lineHeight: 1.05,
  margin: 0,
};

export const Headline = ({ as: Tag = 'h2', hasSeparator, size, ...props }) => {
  const fontSize = SIZE_MAP[size - 1] ? SIZE_MAP[size - 1] : SIZE_MAP[1];
  const fontStyle = mq({ fontSize: [fontSize / 1.5, fontSize] });
  const separatorStyles = hasSeparator ? getSeparatorStyles(fontSize / 2) : null;

  return <Tag css={[baseStyles, fontStyle, separatorStyles]} {...props} />;
};

export const H1 = props => <Headline as="h1" size={1} {...props} />;
export const H2 = props => <Headline as="h2" size={2} {...props} />;
export const H3 = props => <Headline as="h3" size={3} {...props} />;
export const H4 = props => <Headline as="h4" size={4} {...props} />;
export const H5 = props => <Headline as="h5" size={5} {...props} />;
export const H6 = props => <Headline as="h6" size={6} {...props} />;

Headline.propTypes = {
  as: PropTypes.string.isRequired,
  hasSeparator: PropTypes.bool,
  size: PropTypes.number.isRequired,
};

const getSeparatorStyles = gutter => ({
  '&:after': {
    backgroundColor: 'currentColor',
    content: '" "',
    display: 'block',
    height: 6,
    marginTop: gutter,
    width: 50,
  },
});
