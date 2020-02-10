/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useState, useRef, useEffect } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

const AnimateHeight = ({ initialHeight, autoScroll, render, ...props }) => {
  const [height, setHeight] = useState(initialHeight);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const node = useRef();
  const hasMounted = useRef(false);

  useEffect(() => {
    hasMounted.current = true;
  });

  const scrollToTop = () => {
    const element = autoScroll instanceof HTMLElement ? autoScroll : node.current;
    if (element && typeof element.scrollTo === 'function') {
      element.scrollTo(0, 0);
    }
  };

  const calculateHeight = () => {
    const { onChange } = props;
    const newHeight = node.current ? node.current.scrollHeight : initialHeight;

    if (newHeight !== height) {
      setHeight(newHeight);

      if (
        isTransitioning === false &&
        // We don't want to animate on the first render because the initial height will either be 0
        // or the current height of the element. In the 0 case, we don't want to animate because
        // it'd be strange for an element to increase in height immediately after it renders for the
        // first time. In the current height case, we don't want to animate because we're already at
        // that height so there's no point.
        hasMounted.current
      ) {
        setIsTransitioning(true);
      }

      if (autoScroll) {
        scrollToTop();
      }

      if (onChange) {
        onChange(height);
      }
    }
  };

  const observer = useRef(new ResizeObserver(calculateHeight));
  useEffect(() => {
    return () => {
      observer.current.disconnect();
    };
  });

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

  const overflow = isTransitioning ? 'hidden' : null;

  // getNode will never change so i'm not including it in the deps.
  // render will probably change a bunch but that's fine, the reason for
  // memoizing this is so that state updates inside of AnimateHeight don't
  // cause a bunch of rerenders of children
  const renderResult = useMemo(() => render({ ref: getNode }), [render]);

  return (
    <div
      css={{
        height,
        transition: isTransitioning
          ? 'height 220ms cubic-bezier(0.2, 0, 0, 1)'
          : // idk why this is necessary but having this be null makes the transition break
            'height 0s',
        overflow,
      }}
      onTransitionEnd={event => {
        if (event.target === node.current) {
          setIsTransitioning(false);
        }
      }}
      {...props}
    >
      {renderResult}
    </div>
  );
};

AnimateHeight.defaultProps = {
  autoScroll: false,
  initialHeight: 0,
};

export default AnimateHeight;
