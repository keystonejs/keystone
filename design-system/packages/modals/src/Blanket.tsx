/** @jsxRuntime classic */
/** @jsx jsx */

import { HTMLAttributes, forwardRef } from 'react';
import { jsx, keyframes } from '@keystone-ui/core';

const fadeInAnim = keyframes({
  from: {
    opacity: 0,
  },
});
const easing = 'cubic-bezier(0.2, 0, 0, 1)';

export const Blanket = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => {
  return (
    <div
      ref={ref}
      css={{
        animation: `${fadeInAnim} 320ms ${easing}`,
        backgroundColor: 'rgba(0, 0, 0, 0.3)', // TODO get this from the theme
        bottom: 0,
        left: 0,
        position: 'fixed',
        right: 0,
        top: 0,
      }}
      {...props}
    />
  );
});
