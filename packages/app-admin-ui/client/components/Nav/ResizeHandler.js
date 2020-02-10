import { useState, useRef, useEffect } from 'react';
import raf from 'raf-schd';

import { useKeyboardManager } from '../KeyboardShortcuts';

const LS_KEY = 'KEYSTONE_NAVIGATION_STATE';
const DEFAULT_STATE = { isCollapsed: false, width: 280 };
const MIN_WIDTH = 140;
const MAX_WIDTH = 800;
export const KEYBOARD_SHORTCUT = '[';

const LISTENER_OPTIONS = {
  passive: true,
};

function getCache() {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(LS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_STATE;
  }
  return DEFAULT_STATE;
}

function setCache(state) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }
}

const ResizeHandler = ({ children }) => {
  const { isCollapsed: cachedIsCollapsed, width: cachedWidth } = getCache();

  // These should trigger renders
  const [width, setWidth] = useState(cachedWidth);
  const [isCollapsed, setIsCollapsed] = useState(cachedIsCollapsed);
  const [isMouseDown, setIsMouseDown] = useState();
  const [isDragging, setIsDragging] = useState();

  // Internal state tracking
  const delta = useRef();
  const initialX = useRef();
  const initialWidth = useRef();

  const { addBinding, removeBinding } = useKeyboardManager();

  useEffect(() => {
    addBinding(KEYBOARD_SHORTCUT, toggleCollapse);
    return () => {
      removeBinding(KEYBOARD_SHORTCUT);
    };
  });

  useEffect(() => {
    window.addEventListener('mousemove', handleResize, LISTENER_OPTIONS);
    window.addEventListener('mouseup', handleResizeEnd, LISTENER_OPTIONS);

    return () => {
      window.removeEventListener('mousemove', handleResize, LISTENER_OPTIONS);
      window.removeEventListener('mouseup', handleResizeEnd, LISTENER_OPTIONS);
    };
  });

  const storeState = s => {
    // only keep the `isCollapsed` and `width` properties in locals storage
    const newIsCollapsed = s.isCollapsed !== undefined ? s.isCollapsed : isCollapsed;
    const newWidth = s.width !== undefined ? s.width : width;

    setCache({ isCollapsed: newIsCollapsed, width: newWidth });

    setIsCollapsed(newIsCollapsed);
    setWidth(newWidth);
  };

  const handleResizeStart = (event: MouseEvent) => {
    // bail if not "left click"
    if (event.button && event.button > 0) return;

    // initialize resize gesture
    initialX.current = event.pageX;
    setIsMouseDown(true);
  };

  const handleResize = raf((event: MouseEvent) => {
    // on occasion a mouse move event occurs before the event listeners
    // have a chance to detach
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

    delta.current = newDelta;
    setWidth(newWidth);
  });

  const handleResizeEnd = () => {
    // reset non-width states
    delta.current = 0;
    setIsDragging(false);
    setIsMouseDown(false);

    // store the width
    storeState({ width });
  };

  const toggleCollapse = () => {
    storeState({ isCollapsed: !isCollapsed });
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
    delta: delta.current,
    initialX: initialX.current,
    initialWidth: initialWidth.current,
  };

  return children(resizeProps, clickProps, snapshot);
};

export default ResizeHandler;
