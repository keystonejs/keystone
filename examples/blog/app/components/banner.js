/** @jsx jsx */
import { jsx } from '@emotion/core';

export const Banner = ({ style = 'success', children }) => {
  return (
    <div
      css={{
        background: style === 'success' ? '#90ee9061' : '#ee909061',
        border: `1px solid ${style === 'success' ? 'green' : 'red'}`,
        color: style === 'success' ? 'green' : 'red',
        padding: 12,
        marginBottom: 32,
        borderRadius: 6,
      }}
    >
      <span>{children}</span>
    </div>
  );
};
