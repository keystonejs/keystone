/** @jsx jsx */

import { jsx } from '@emotion/core';

export default ({ data }) => {
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
