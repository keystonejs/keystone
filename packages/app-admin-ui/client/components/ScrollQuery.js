import { createRef, useState, useRef, useEffect } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import raf from 'raf-schd';

const LISTENER_OPTIONS = { passive: true };

const ScrollQuery = ({ isPassive, children, render }) => {
  const [hasScroll, setHasScroll] = useState(false);
  const [isTop, setIsTop] = useState(false);
  const [isBottom, setIsBottom] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const scrollElement = createRef();
  const resizeObserver = useRef();

  useEffect(() => {
    const scrollEl = scrollElement.current;

    if (!isPassive) {
      scrollEl.addEventListener('scroll', handleScroll, LISTENER_OPTIONS);
    }

    resizeObserver.current = new ResizeObserver(([entry]) => {
      setScroll(entry.target);
    });

    resizeObserver.current.observe(scrollEl);
    setScroll(scrollEl);

    return () => {
      if (!isPassive) {
        scrollEl.removeEventListener('scroll', handleScroll, LISTENER_OPTIONS);
      }

      if (resizeObserver.current && scrollEl) {
        resizeObserver.current.disconnect(scrollEl);
      }

      resizeObserver.current = null;
    };
  });

  const handleScroll = raf(event => {
    setScroll(event.target);
  });

  const setScroll = target => {
    const { clientHeight, scrollHeight: _scrollHeight, scrollTop: _scrollTop } = target;

    const _isScrollable = scrollHeight > clientHeight;
    const _isBottom = scrollTop === scrollHeight - clientHeight;
    const _isTop = scrollTop === 0;
    const _hasScroll = !!scrollTop;

    if (
      // we only need to compare some parts of state
      // because some of the parts are computed from scrollTop
      isBottom !== _isBottom ||
      isScrollable !== _isScrollable ||
      scrollHeight !== _scrollHeight ||
      scrollTop !== _scrollTop
    ) {
      setIsBottom(_isBottom);
      setIsTop(_isTop);
      setIsScrollable(_isScrollable);
      setScrollHeight(_scrollHeight);
      setScrollTop(_scrollTop);
      setHasScroll(_hasScroll);
    }
  };

  const snapshot = {
    hasScroll,
    isTop,
    isBottom,
    isScrollable,
    scrollHeight,
    scrollTop,
  };

  return render ? render(scrollElement, snapshot) : children(scrollElement, snapshot);
};

ScrollQuery.defaultProps = {
  isPassive: true,
};

export default ScrollQuery;
