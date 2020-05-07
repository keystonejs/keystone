import { useState, useEffect, useRef, useCallback } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import raf from 'raf-schd';

const LISTENER_OPTIONS = { passive: true };

export const useScrollQuery = ({ isPassive = true }) => {
  const scrollElement = useRef();
  const resizeObserver = useRef();

  const [snapshot, setSnapshot] = useState({});

  const setScroll = useCallback(target => {
    const { clientHeight, scrollHeight, scrollTop } = target;

    const isBottom = scrollTop === scrollHeight - clientHeight;
    const isTop = scrollTop === 0;
    const isScrollable = scrollHeight > clientHeight;
    const hasScroll = !!scrollTop;

    setSnapshot({
      isBottom,
      isTop,
      isScrollable,
      scrollHeight,
      scrollTop,
      hasScroll,
    });
  }, []);

  useEffect(() => {
    const { current } = scrollElement;

    if (!isPassive && current) {
      const handleScroll = raf(event => {
        setScroll(event.target);
      });

      current.addEventListener('scroll', handleScroll, LISTENER_OPTIONS);
      return () => {
        current.removeEventListener('scroll', handleScroll, LISTENER_OPTIONS);
      };
    }
  }, [isPassive]);

  // Not using useResizeObserver since we want to operate with the element on resize, not the dimensions
  useEffect(() => {
    const { current } = scrollElement;

    resizeObserver.current = new ResizeObserver(
      raf(([entry]) => {
        setScroll(entry.target);
      })
    );

    resizeObserver.current.observe(current);
    setScroll(current);

    return () => {
      if (resizeObserver.current && current) {
        resizeObserver.current.disconnect(current);
      }

      resizeObserver.current = null;
    };
  }, []);

  return [scrollElement, snapshot];
};
