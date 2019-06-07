/** @jsx jsx */

import { jsx } from '@emotion/core';
import * as React from 'react';

const Preview = ({ data, originalUrl, ...props }) => {
  if (!data) {
    return null;
  }

  return (
    <div css={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} {...props}>
      {data.html && (
        <div
          css={{ minWidth: '100px', marginRight: '0.8em' }}
          dangerouslySetInnerHTML={{ __html: data.html }}
        />
      )}
      <div css={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <span>{data.title}</span>
        <a href={originalUrl} target="_blank">
          {originalUrl}
        </a>
      </div>
    </div>
  );
};

export default Preview;
