import React, { PureComponent, Fragment } from 'react';
import { createPortal } from 'react-dom';
import ScrollLock from 'react-scrolllock';
import FocusTrap from 'focus-trap-react';

import { fade, slideUp, withTransitionState, Blanket, generateUEID } from '@arch-ui/modal-utils';
import { A11yText } from '@arch-ui/typography';

import { Body, Dialog, Footer, Header, Positioner, Title } from './primitives';

class ModalDialog extends PureComponent {
  static defaultProps = {
    attachTo: typeof document !== 'undefined' ? document.body : null,
    closeOnBlanketClick: false,
    component: 'div',
    width: 640,
  };
  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown, false);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown, false);
  }
  onKeyDown = e => {
    if (this.props.onKeyDown) this.props.onKeyDown(e);
  };
  render() {
    const {
      attachTo,
      children,
      closeOnBlanketClick,
      component,
      footer,
      heading,
      initialFocus,
      onClose,
      width,
      transitionState,
    } = this.props;
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
              <Body>{children}</Body>
              {footer ? <Footer>{footer}</Footer> : null}
            </Dialog>
          </FocusTrap>
        </Positioner>
        <ScrollLock />
      </Fragment>,
      attachTo
    );
  }
}

export default withTransitionState(ModalDialog);
