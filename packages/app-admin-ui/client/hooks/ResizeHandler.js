import { useState, useRef, useEffect } from 'react';
import raf from 'raf-schd';

import { useKeyboardManager } from '../providers/KeyboardShortcuts';

const LS_KEY = 'KEYSTONE_NAVIGATION_STATE';
const DEFAULT_STATE = { isCollapsed: false, width: 280 };
const MIN_WIDTH = 140;
const MAX_WIDTH = 800;

export const KEYBOARD_SHORTCUT = '[';

const getCache = () => {
  if (localStorage !== undefined) {
    const stored = localStorage.getItem(LS_KEY);

    if (stored) {
      return JSON.parse(stored);
    }
  }

  return DEFAULT_STATE;
};

const setCache = state => {
  if (localStorage !== undefined) {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }
};

export const useResizeHandler = () => {
  // TODO: should we be calling this in the function body?
  const { width: cachedWidth, isCollapsed: cachedIsCollapsed } = getCache();

  // These should trigger renders
  const [width, setWidth] = useState(cachedWidth);
  const [isCollapsed, setIsCollapsed] = useState(cachedIsCollapsed);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Internal state tracking
  const initialX = useRef();
  const initialWidth = useRef();

  const { addBinding, removeBinding } = useKeyboardManager();

  useEffect(() => {
    addBinding(KEYBOARD_SHORTCUT, toggleCollapse);
    return () => {
      removeBinding(KEYBOARD_SHORTCUT);
    };
  }, []);

  useEffect(() => {
    const handleResize = raf(event => {
      // on occasion a mouse move event occurs before the event listeners have a chance to detach
      if (!isMouseDown) return;

      // initialize dragging
      if (!isDragging) {
        setIsDragging(true);
        initialWidth.current = width;
        return;
      }

      // allow the product nav to be 75% of the available page width
      const adjustedMax = MAX_WIDTH - initialWidth.current;
      const adjustedMin = MIN_WIDTH - initialWidth.current;

      const newDelta = Math.max(Math.min(event.pageX - initialX.current, adjustedMax), adjustedMin);
      const newWidth = initialWidth.current + newDelta;

      setWidth(newWidth);
    });

    const handleResizeEnd = () => {
      // reset non-width states
      setIsDragging(false);
      setIsMouseDown(false);
    };

    window.addEventListener('mousemove', handleResize, { passive: true });
    window.addEventListener('mouseup', handleResizeEnd, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleResize, { passive: true });
      window.removeEventListener('mouseup', handleResizeEnd, { passive: true });
    };
  }, [isMouseDown, isDragging]);

  // Only keep the `isCollapsed` and `width` properties in locals storage
  useEffect(() => {
    setCache({ isCollapsed, width });
  }, [isCollapsed, width]);

  const handleResizeStart = event => {
    // bail if not "left click"
    if (event.button && event.button > 0) return;

    // initialize resize gesture
    initialX.current = event.pageX;
    setIsMouseDown(true);
  };

  const toggleCollapse = () => {
    setIsCollapsed(prevCollapsed => !prevCollapsed);
  };

  const resizeProps = {
    title: 'Drag to Resize',
    onMouseDown: handleResizeStart,
  };

  const clickProps = {
    onClick: toggleCollapse,
  };

  const snapshot = {
    width,
    isCollapsed,
    isMouseDown,
    isDragging,
    initialX: initialX.current,
    initialWidth: initialWidth.current,
  };

  return { resizeProps, clickProps, snapshot };
};
