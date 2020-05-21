/** @jsx jsx */

import { jsx } from '@emotion/core';
import { forwardRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { borderRadius, colors, gridSize, shadows } from '@arch-ui/theme';
import FocusTrap from 'focus-trap-react';
import { withModalHandlers, springDown } from '@arch-ui/modal-utils';
import { usePopper } from 'react-popper';

const ARROW_WIDTH = 30;

const Wrapper = forwardRef(({ left, top, width, ...props }, ref) => (
  <div
    ref={ref}
    css={{
      backgroundColor: 'white',
      borderRadius: borderRadius * 2,
      boxShadow: shadows[2],
      marginTop: gridSize * 2,
      maxHeight: '100%',
      zIndex: 200,
      width,
    }}
    {...props}
  />
));

const WrapperInner = forwardRef((props, ref) => (
  <div ref={ref} css={{ position: 'relative' }} {...props} />
));

const Arrow = forwardRef(({ style }, ref) => (
  <div
    ref={ref}
    css={{
      height: ARROW_WIDTH,
      marginTop: '-11px',
      position: 'absolute',
      width: ARROW_WIDTH,
    }}
    style={style}
  >
    <svg
      viewBox="0 0 30 30"
      style={{ transform: 'rotate(90deg)' }}
      focusable="false"
      role="presentation"
    >
      <path
        css={{ fill: colors.text, fillOpacity: 0.1 }}
        d="M8.11 6.302c1.015-.936 1.887-2.922 1.887-4.297v26c0-1.378-.868-3.357-1.888-4.297L.925 17.09c-1.237-1.14-1.233-3.034 0-4.17L8.11 6.302z"
      />
      <path
        css={{ fill: 'white' }}
        d="M8.787 7.036c1.22-1.125 2.21-3.376 2.21-5.03V0v30-2.005c0-1.654-.983-3.9-2.21-5.03l-7.183-6.616c-.81-.746-.802-1.96 0-2.7l7.183-6.614z"
      />
    </svg>
  </div>
));

const Popout = ({ children, targetNode, contentNode, getModalRef, style, width = 320 }) => {
  const [arrowElement, setArrowElement] = useState(null);

  const { styles } = usePopper(targetNode, contentNode, {
    placement: 'bottom',
    modifiers: [{ name: 'arrow', options: { element: arrowElement } }],
  });

  const attachTo = typeof document !== 'undefined' ? document.body : null;
  return attachTo
    ? createPortal(
        <div ref={getModalRef} style={{ ...styles.popper, zIndex: 2 }}>
          <Wrapper
            width={width}
            style={style} // style comes from Transition
          >
            <FocusTrap focusTrapOptions={{ clickOutsideDeactivates: true }}>
              <WrapperInner>
                <Arrow ref={setArrowElement} style={styles.arrow} />
                {children}
              </WrapperInner>
            </FocusTrap>
          </Wrapper>
        </div>,
        attachTo
      )
    : null;
};

export default withModalHandlers(Popout, { transition: springDown });
