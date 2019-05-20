/** @jsx jsx */

import { jsx } from '@emotion/core';
import { mq } from '../helpers/media';

export default function Container(props) {
  const paddingHorizontal = ['1rem', '2rem'];

  return (
    <div
      css={mq({
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: paddingHorizontal,
        paddingRight: paddingHorizontal,
        maxWidth: 1000
      })}
      {...props}
    />
  );
}
