/** @jsx jsx */

import { jsx } from '@emotion/core';

const Preview = ({ data, originalUrl, fieldPath, ...props }) => {
  if (!data) {
    return null;
  }

  return (
    <div
      css={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
      {...props}
      id={`ks-oembed-preview-${fieldPath}`}
    >
      {data.html && (
        <div
          css={{
            minWidth: '60px',
            maxWidth: '150px',
            flexShrink: 0,
            overflow: 'hidden',
            marginRight: '0.8em',
          }}
          dangerouslySetInnerHTML={{ __html: data.html }}
        />
      )}
      <div
        css={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap', overflow: 'hidden' }}
      >
        <span>{data.title}</span>
        <a href={originalUrl} target="_blank">
          {originalUrl}
        </a>
      </div>
    </div>
  );
};

export default Preview;
