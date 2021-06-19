/** @jsx jsx */
import { jsx } from '@emotion/react';

export function Alert({ look = 'neutral', className, ...props }) {
  return <p className={`hint ${look} ${className}`} {...props} />;
}
