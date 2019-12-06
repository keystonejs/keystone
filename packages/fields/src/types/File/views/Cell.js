/** @jsx jsx */

import { jsx } from '@emotion/core';

const Image = ({ alt, src }) => (
  <div
    css={{
      alignItems: 'center',
      display: 'flex',
      height: 24,
      lineHeight: 0,
      width: 24,
    }}
  >
    <img alt={alt} css={{ maxHeight: '100%', maxWidth: '100%' }} src={src} />
  </div>
);

export default ({ data }) => {
  if (!data) return null;

  const isImage = data.mimetype.includes('image');
  const truncatedFilename = data.filename.replace(`${data.id}-`, '');

  return isImage ? (
    <Image alt={truncatedFilename} src={data.publicUrl} />
  ) : (
    <div>{truncatedFilename}</div>
  );
};
