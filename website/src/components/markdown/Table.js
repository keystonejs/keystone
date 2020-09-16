/** @jsx jsx */

import { useEffect, useRef, useState } from 'react';
import throttle from 'lodash.throttle';
import { jsx } from '@emotion/core';
import { colors, gridSize } from '@arch-ui/theme';

export const Table = props => {
  const ref = useRef();
  const [hasScroll, setHasScroll] = useState(false);
  const [isScrollable, setScrollable] = useState(false);
  const [isScrollEnd, setScrollEnd] = useState(false);

  const handleScroll = throttle(() => {
    const el = ref.current;

    setScrollable(el.scrollWidth > el.clientWidth);
    setHasScroll(Boolean(el.scrollLeft));
    setScrollEnd(el.scrollLeft === el.scrollWidth - el.clientWidth);
  }, 200);

  useEffect(() => {
    const el = ref.current; // store the ref for cleanup

    el.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll, true);

    return () => {
      el.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll, true);
    };
  }, [ref.current]);

  // run once on mount
  useEffect(handleScroll, []);

  const makeGradient = clr => `linear-gradient(transparent, ${clr} 10%, ${clr} 90%, transparent)`;
  const makeMask = (width, side, gradient) => {
    const condition = side === 'left' ? hasScroll : !isScrollEnd;
    return {
      background: gradient,
      bottom: 0,
      content: '" "',
      pointerEvents: 'none',
      position: 'absolute',
      top: 0,
      transition: 'opacity 200ms linear',
      [side]: 0,
      opacity: condition ? 1 : 0,
      width,
    };
  };

  const outerStyles = isScrollable
    ? {
        position: 'relative',

        '&::before': makeMask(3, 'left', makeGradient('rgba(9, 30, 66, 0.08)')),
        '&::after': makeMask(3, 'right', makeGradient('rgba(9, 30, 66, 0.08)')),
      }
    : null;
  const innerStyles = isScrollable
    ? {
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',

        '&::before': makeMask(1, 'left', makeGradient('rgba(9, 30, 66, 0.12)')),
        '&::after': makeMask(1, 'right', makeGradient('rgba(9, 30, 66, 0.12)')),
      }
    : null;

  return (
    <div css={outerStyles}>
      <div css={innerStyles} ref={ref}>
        <table
          css={{
            borderCollapse: 'collapse',
            borderSpacing: 0,
            whiteSpace: 'nowrap',
            width: '100%',

            'th, td': {
              paddingBottom: gridSize,
              paddingTop: gridSize,
              textAlign: 'left',

              '&:not(:first-of-type)': {
                paddingLeft: gridSize,
              },

              '&:not(:last-of-type)': {
                paddingRight: gridSize,
              },

              '&:last-of-type, &:nth-last-of-type(2)': {
                whiteSpace: 'normal',
              },

              '&[align="right"]': {
                textAlign: 'right',
              },
            },
            th: {
              borderBottom: `2px solid ${colors.N10}`,
              fontWeight: 500,
            },
            td: {
              borderTop: `1px solid ${colors.N10}`,
            },
          }}
          {...props}
        />
      </div>
    </div>
  );
};
