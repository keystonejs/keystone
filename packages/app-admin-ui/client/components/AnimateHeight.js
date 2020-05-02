/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useState, useRef, useEffect } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import raf from 'raf-schd';

// TODO: see if this can use the useResizeObserver hook. Was having trouble doing so -CD
const AnimateHeight = ({ autoScroll = false, initialHeight = 0, onChange, render, ...props }) => {
  const [height, setHeight] = useState(initialHeight);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const node = useRef();
  const hasMounted = useRef(false);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  const calculateHeight = () => {
    const nodeHeight = node.current ? node.current.offsetHeight : initialHeight;

    if (nodeHeight !== height) {
      setHeight(nodeHeight);

      // We don't want to animate on the first render because the initial height will
      // either be 0 or the current height of the element. In the 0 case, we don't want
      // to animate because it'd be strange for an element to increase in height immediately
      // after it renders for the first time. In the current height case, we don't want
      // to animate because we're already at that height so there's no point.
      if (isTransitioning === false && hasMounted.current) {
        setIsTransitioning(true);
      }

      if (autoScroll) {
        const element = autoScroll instanceof HTMLElement ? autoScroll : node.current;
        if (element && typeof element.scrollTo === 'function') {
          element.scrollTo(0, 0);
        }
      }

      if (onChange) {
        onChange(nodeHeight);
      }
    }
  };

  const observer = useRef(new ResizeObserver(raf(calculateHeight)));

  // Disconnect on unmount
  useEffect(() => () => observer.current.disconnect(), []);

  const getNode = ref => {
    if (!ref) return;

    if (node.current !== ref) {
      if (node.current) {
        observer.current.unobserve(node.current);
      }

      observer.current.observe(ref);
    }

    node.current = ref;
    calculateHeight();
  };

  // getNode will never change so i'm not including it in the deps.
  // render will probably change a bunch but that's fine. The reason for
  // memoizing this is so that state updates inside of AnimateHeight don't
  // cause a bunch of rerenders of children.
  const renderRes = useMemo(() => render({ ref: getNode }), [render]);

  return (
    <div
      css={{
        height,
        ...(isTransitioning
          ? {
              transition: 'height 220ms cubic-bezier(0.2, 0, 0, 1)',
              overflow: 'hidden',
            }
          : {
              transition: 'none',
              overflow: null,
            }),
      }}
      onTransitionEnd={event => {
        if (event.target === node.current) {
          setIsTransitioning(false);
        }
      }}
      {...props}
    >
      {renderRes}
    </div>
  );
};

export default AnimateHeight;
