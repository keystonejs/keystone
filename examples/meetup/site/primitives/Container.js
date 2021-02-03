/** @jsx jsx */

import { jsx } from '@emotion/core';
import PropTypes from 'prop-types';
import { mq } from '../helpers/media';

export const CONTAINER_GUTTER = ['1rem', '2rem'];

export default function Container({ width = 1000, ...props }) {
  return (
    <div
      css={mq({
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: CONTAINER_GUTTER,
        paddingRight: CONTAINER_GUTTER,
        maxWidth: width,
      })}
      {...props}
    />
  );
}

Container.propTypes = {
  width: PropTypes.number,
};
