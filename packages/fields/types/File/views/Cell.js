// @flow
/** @jsx jsx */

import { jsx } from '@emotion/core';
import type { CellProps } from '../../../types';

type ImageProps = { alt: string, src: string };

const Image = ({ alt, src }: ImageProps) => (
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

type Props = CellProps<{
  id: string,
  path: string,
  filename: string,
  mimetype: string,
  encoding: string,
  publicUrl: string,
}>;

export default ({ data }: Props) => {
  if (!data) return null;

  const isImage = data.mimetype.includes('image');
  const truncatedFilename = data.filename.replace(`${data.id}-`, '');

  return isImage ? (
    <Image alt={truncatedFilename} src={data.publicUrl} />
  ) : (
    <div>{truncatedFilename}</div>
  );
};
