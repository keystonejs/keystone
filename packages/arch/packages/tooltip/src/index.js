/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import flushable from 'flushable';
import styled from '@emotion/styled';
import { usePopper } from 'react-popper';

import { TransitionProvider, fade } from '@arch-ui/modal-utils';
import { colors, gridSize } from '@arch-ui/theme';

// ==============================
// Styled Component
// ==============================

const TooltipElement = styled.div({
  backgroundColor: colors.N80,
  borderRadius: 3,
  color: 'white',
  fontSize: '0.75rem',
  fontWeight: 500,
  padding: `${gridSize / 2}px ${gridSize}px`,
  pointerEvents: 'none', // tooltips are non-interactive, they shouldn't get in the way of other elements
  zIndex: 2,
});

const TooltipPositioner = ({ targetNode, placement, style, className, children }) => {
  const [popperElement, setPopperElement] = useState(null);

  const { styles } = usePopper(targetNode, popperElement, {
    placement,
    modifiers: [
      { name: 'hide', enabled: false },
      { name: 'preventOverflow', enabled: false },
    ],
  });

  return createPortal(
    <div ref={setPopperElement} css={{ zIndex: 2000 }} style={{ ...style, ...styles.popper }}>
      <div css={{ margin: gridSize }}>
        <TooltipElement className={className}>{children}</TooltipElement>
      </div>
    </div>,
    document.body
  );
};

// ==============================
// Stateful Component
// ==============================

const LISTENER_OPTIONS = { passive: true };

let pendingHide;

const showTooltip = (fn, defaultDelay) => {
  const isHidePending = pendingHide && pendingHide.pending();
  if (isHidePending) {
    pendingHide.flush();
  }

  const pendingShow = flushable(fn, isHidePending ? 0 : defaultDelay);
  return pendingShow.cancel;
};

const hideTooltip = (fn, defaultDelay) => {
  pendingHide = flushable(fn, defaultDelay);
  return pendingHide.cancel;
};

const Tooltip = ({
  children,
  content,
  onHide,
  onShow,
  placement = 'bottom',
  className,
  hideOnMouseDown,
  hideOnKeyDown,
  delay = 300,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const target = ref.current;

    if (!target) {
      throw new Error('You must pass the ref onto your target node.');
    }

    if (!target.nodeName) {
      throw new Error(
        "It looks like you've passed the ref onto a component. You must pass the ref onto your target node."
      );
    }

    let cancelPendingSetState = () => {};

    const cancel = () => {
      cancelPendingSetState();
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      cancelPendingSetState();

      if (isVisible) {
        return;
      }

      if (hideOnMouseDown && target) {
        target.addEventListener('mousedown', cancel, LISTENER_OPTIONS);
      }

      if (hideOnKeyDown) {
        document.addEventListener('keydown', cancel, LISTENER_OPTIONS);
      }

      cancelPendingSetState = showTooltip(() => setIsVisible(true), delay);
    };

    const handleMouseLeave = () => {
      cancelPendingSetState();

      if (!isVisible) {
        return;
      }

      if (hideOnMouseDown && target) {
        target.removeEventListener('mousedown', cancel, LISTENER_OPTIONS);
      }

      if (hideOnKeyDown) {
        document.removeEventListener('keydown', cancel, LISTENER_OPTIONS);
      }

      cancelPendingSetState = hideTooltip(() => setIsVisible(false), delay);
    };

    target.addEventListener('mouseenter', handleMouseEnter, LISTENER_OPTIONS);
    target.addEventListener('mouseleave', handleMouseLeave, LISTENER_OPTIONS);

    return () => {
      cancelPendingSetState();

      if (target) {
        target.removeEventListener('mouseenter', handleMouseEnter, LISTENER_OPTIONS);
        target.removeEventListener('mouseleave', handleMouseLeave, LISTENER_OPTIONS);
      }
    };
  }, [isVisible]);

  return (
    <Fragment>
      {children(ref)}

      <TransitionProvider isOpen={isVisible} onEntered={onShow} onExited={onHide}>
        {transitionState => (
          <TooltipPositioner
            targetNode={ref.current}
            placement={placement}
            className={className}
            style={fade(transitionState)}
          >
            {content}
          </TooltipPositioner>
        )}
      </TransitionProvider>
    </Fragment>
  );
};

export default Tooltip;
