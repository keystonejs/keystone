import React, { memo, Fragment, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ScrollLock from 'react-scrolllock';
import FocusTrap from 'focus-trap-react';

import { fade, slideUp, withTransitionState, Blanket, generateUEID } from '@arch-ui/modal-utils';
import { A11yText } from '@arch-ui/typography';

import { Body, Dialog, Footer, Header, Positioner, Title } from './primitives';

const ModalDialog = memo(
  ({
    attachTo = typeof document !== 'undefined' ? document.body : null,
    children,
    closeOnBlanketClick = false,
    component = 'div',
    footer,
    heading,
    initialFocus,
    onClose,
    onKeyDown,
    transitionState,
    width = 640,
  }) => {
    useEffect(() => {
      const handleKeyDown = e => {
        if (onKeyDown) onKeyDown(e);
      };

      document.addEventListener('keydown', handleKeyDown, false);
      return () => {
        document.removeEventListener('keydown', handleKeyDown, false);
      };
    });

    const dialogTitleId = generateUEID();

    if (!attachTo) {
      return null;
    }

    return createPortal(
      <Fragment>
        <Blanket
          style={fade(transitionState)}
          onClick={closeOnBlanketClick ? onClose : undefined}
          isTinted
        />
        <Positioner style={slideUp(transitionState)} width={width}>
          <FocusTrap
            focusTrapOptions={{
              initialFocus,
              clickOutsideDeactivates: closeOnBlanketClick,
            }}
          >
            <Dialog component={component} aria-labelledby={dialogTitleId}>
              <A11yText id={dialogTitleId}>{heading} Dialog</A11yText>
              {heading ? (
                <Header>
                  <Title>{heading}</Title>
                </Header>
              ) : null}
              <ScrollLock>
                <Body>{children}</Body>
              </ScrollLock>
              {footer ? <Footer>{footer}</Footer> : null}
            </Dialog>
          </FocusTrap>
        </Positioner>
      </Fragment>,
      attachTo
    );
  }
);

export default withTransitionState(ModalDialog);
