/** @jsx jsx */

import React, { useEffect, useRef, useState } from 'react'; // eslint-disable-line no-unused-vars
import { jsx } from '@emotion/core';
import { colors, gridSize } from '@arch-ui/theme';

export const Table = props => {
  const ref = useRef();
  const [hasScroll, setHasScroll] = useState(false);
  const [isScrollable, setScrollable] = useState(false);
  const [isScrollEnd, setScrollEnd] = useState(false);

  const handleScroll = e => {
    if (!isScrollable) {
      return;
    }

    const el = ref.current;

    setHasScroll(Boolean(el.scrollLeft));
    setScrollEnd(el.scrollLeft === el.scrollWidth - el.clientWidth);

    console.log('handleScroll', e);
  };

  useEffect(() => {
    setScrollable(ref.current.scrollWidth > ref.current.clientWidth);
  }, []);

  useEffect(() => {
    ref.current.addEventListener('scroll', handleScroll, true);
    return () => {
      ref.current.addEventListener('scroll', handleScroll, true);
    };
  }, [ref.current]);

  const maskStyles = {
    bottom: 0,
    content: '" "',
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    transition: 'opacity 200ms linear',
    width: 3,
  };
  const mobilePanStyles = isScrollable
    ? {
        overflowX: 'auto',
        position: 'relative',
        WebkitOverflowScrolling: 'touch',

        '&::before': {
          ...maskStyles,
          backgroundColor: `rgba(9, 30, 66, 0.08)`,
          borderLeft: `1px solid rgba(9, 30, 66, 0.12)`,
          left: 0,
          opacity: hasScroll ? 1 : 0,
        },
        '&::after': {
          ...maskStyles,
          backgroundColor: `rgba(9, 30, 66, 0.08)`,
          borderRight: `1px solid rgba(9, 30, 66, 0.12)`,
          right: 0,
          opacity: !isScrollEnd ? 1 : 0,
        },
      }
    : null;

  return (
    <div css={mobilePanStyles}>
      <div css={{ overflowX: 'auto' }} ref={ref}>
        <table
          css={{
            borderCollapse: 'collapse',
            borderSpacing: 0,
            fontSize: '0.9rem',
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
