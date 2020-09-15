/** @jsx jsx */

import { Fragment } from 'react';
import { jsx } from '@emotion/core';

export const BlogMeta = ({ author, date }) => (
  <p
    css={{
      margin: 0,
      marginTop: '0.75rem',
      padding: 0,
      fontSize: '.8rem',
    }}
  >
    <Fragment>
      By <strong>{author || 'Keystone'}</strong>
      {date ? <Fragment>, Published on {date}</Fragment> : null}
    </Fragment>
  </p>
);
