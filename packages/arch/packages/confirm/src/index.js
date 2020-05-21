/** @jsx jsx */

import { Fragment, memo, forwardRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ScrollLock from 'react-scrolllock';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';

import { borderRadius, shadows } from '@arch-ui/theme';
import FocusTrap from 'focus-trap-react';
import { fade, zoomInDown, withTransitionState, Blanket } from '@arch-ui/modal-utils';

const innerGutter = 15;

// Styled Components
// ------------------------------

const Positioner = styled.div({
  display: 'flex',
  justifyContent: 'center',
  left: 0,
  position: 'fixed',
  top: 0,
  width: '100%',
  zIndex: 2,
});

const Dialog = forwardRef(({ component: Tag, width, ...props }, ref) => (
  <Tag
    ref={ref}
    role="alertdialog"
    css={{
      backgroundColor: 'white',
      borderBottomRightRadius: borderRadius * 2,
      borderBottomLeftRadius: borderRadius * 2,
      boxShadow: shadows[2],
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '100%',
      maxWidth: '96%',
      width: width,
    }}
    {...props}
  />
));

// Content
const Body = styled.div({
  lineHeight: 1.4,
  padding: innerGutter,
});

const ModalConfirm = memo(
  ({
    attachTo = typeof document !== 'undefined' ? document.body : null,
    children,
    component = 'div',
    onKeyDown,
    transitionState,
    width = 400,
  }) => {
    useEffect(() => {
      const handleKeyDown = e => {
        if (onKeyDown) onKeyDown(e);
      };

      document.addEventListener('keydown', handleKeyDown, false);
      return () => {
        document.removeEventListener('keydown', handleKeyDown, false);
      };
    }, [onkeydown]);

    if (!attachTo) {
      return null;
    }

    return createPortal(
      <Fragment>
        <Blanket style={fade(transitionState)} isTinted isLight />
        <Positioner style={zoomInDown(transitionState)}>
          <FocusTrap>
            <Dialog component={component} width={width}>
              <Body>{children}</Body>
            </Dialog>
          </FocusTrap>
          <ScrollLock />
        </Positioner>
      </Fragment>,
      attachTo
    );
  }
);

export default withTransitionState(ModalConfirm);
