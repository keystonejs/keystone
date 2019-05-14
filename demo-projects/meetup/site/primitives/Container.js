/** @jsx jsx */
import { jsx } from '@emotion/core';

export default function Container({ children, ...props }) {
  return (
    <div
      css={{ marginLeft: 'auto', marginRight: 'auto', padding: '0 2rem', maxWidth: 1000 }}
      {...props}
    >
      {children}
    </div>
  );
}
