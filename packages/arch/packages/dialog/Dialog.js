// @flow

import React, { PureComponent, Fragment, type ComponentType, type Element, type Node } from 'react';
import { createPortal } from 'react-dom';
import ScrollLock from 'react-scrolllock';
import FocusTrap, { type FocusTarget } from 'react-focus-marshal';

import { Fade, SlideUp, withTransitionState, Blanket } from '../modal-utils';
import { generateUEID } from '../utils';
import { A11yText } from '../typography';

import { Body, Dialog, Footer, Header, Positioner, Title } from './primitives';

// Dialog
// ------------------------------

type Props = {
  attachTo: HTMLElement,
  children: Node,
  closeOnBlanketClick: boolean,
  component: ComponentType<*> | string,
  footer?: Element<*>,
  heading?: string,
  initialFocus?: FocusTarget,
  onClose: (*) => void,
  onKeyDown: (*) => void,
  width?: number,
};

class ModalDialog extends PureComponent<Props> {
  static defaultProps = {
    attachTo: document.body,
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
  onKeyDown = (e: any) => {
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
      ...transitionProps
    } = this.props;
    const dialogTitleId = generateUEID();

    return createPortal(
      <Fragment>
        <Fade {...transitionProps}>
          <Blanket onClick={closeOnBlanketClick ? onClose : undefined} isTinted />
        </Fade>
        <SlideUp {...transitionProps}>
          <Positioner width={width}>
            <FocusTrap
              options={{
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
        </SlideUp>
        <ScrollLock />
      </Fragment>,
      attachTo
    );
  }
}

export default withTransitionState(ModalDialog);
