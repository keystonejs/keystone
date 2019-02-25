// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import type { CellProps } from '@voussoir/admin-view/types';

type Props = CellProps<{
  id: string,
  path: string,
  filename: string,
  mimetype: string,
  encoding: string,
  publicUrlTransformed: string,
}>;

export const CloudinaryImageCell = ({ data }: Props) => {
  if (!data) return null;

  return (
    <div
      css={{
        alignItems: 'center',
        display: 'flex',
        height: 24,
        lineHeight: 0,
        width: 24,
      }}
    >
      <img
        alt={data.filename}
        css={{ maxHeight: '100%', maxWidth: '100%' }}
        src={data.publicUrlTransformed}
      />
    </div>
  );
};
