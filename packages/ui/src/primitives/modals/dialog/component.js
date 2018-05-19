// @flow

import React, { Component, Fragment, type Element, type Node } from 'react';
import ScrollLock from 'react-scrolllock';

import FocusTrap, { type FocusTarget } from '../FocusTrap';
import { Fade, SlideUp } from '../transitions';
import { withModalGateway } from '../provider';

import {
  Blanket,
  Body,
  Dialog,
  Footer,
  Header,
  Positioner,
  Title,
} from './styled';

// Dialog
// ------------------------------

type Props = {
  children: Node,
  footer?: Element<*>,
  heading?: string,
  initialFocus?: FocusTarget,
  in: boolean,
  onClose: (*) => void,
  onKeyDown: (*) => void,
  width?: number,
};

class ModalDialog extends Component<Props> {
  static defaultProps = {
    width: 640,
  };
  componentDidMount() {
    console.log('dialog -- DidMount');
    document.addEventListener('keydown', this.onKeyDown, false);
  }
  componentWillUnmount() {
    console.log('dialog -- WillUnmount');
    document.removeEventListener('keydown', this.onKeyDown, false);
  }
  onKeyDown = (e: any) => {
    if (this.props.onKeyDown) this.props.onKeyDown(e);
  };
  render() {
    const {
      children,
      footer,
      heading,
      initialFocus,
      in: show,
      onClose,
      width,
    } = this.props;

    return (
      <Fragment>
        <Fade in={show}>
          <Blanket onClick={onClose} />
        </Fade>
        <SlideUp in={show}>
          <Positioner width={width}>
            <FocusTrap options={{ initialFocus }}>
              <Dialog>
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
        {show ? <ScrollLock /> : null}
      </Fragment>
    );
  }
}

export default withModalGateway(ModalDialog, 'dialog');
