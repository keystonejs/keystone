// @flow

import React, {
  Fragment,
  PureComponent,
  type ComponentType,
  type Ref,
  type Node,
} from 'react';
import { createPortal } from 'react-dom';
import styled from 'react-emotion';
import ScrollLock from 'react-scrolllock';

import { borderRadius } from '../../theme';
import FocusTrap from './FocusTrap';
import { Fade, SlideDown, withTransitionState } from './transitions';
import { Blanket } from './common';

const innerGutter = 15;

// Styled Components
// ------------------------------

const Positioner = styled.div({
  justifyContent: 'center',
  display: 'flex',
  left: 0,
  width: '100%',
  position: 'fixed',
  top: 0,
  zIndex: 2,
});

type DialogElementProps = {
  component: ComponentType<*> | string,
  innerRef?: Ref<*>,
  width: number,
};
const Dialog = ({
  component: Tag,
  innerRef,
  width,
  ...props
}: DialogElementProps) => (
  <Tag
    ref={innerRef}
    role="alertdialog"
    css={{
      backgroundColor: 'white',
      borderBottomRightRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
      boxShadow:
        '0 0 0 1px rgba(0, 0, 0, 0.175), 0 3px 8px rgba(0, 0, 0, 0.175)',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '100%',
      maxWidth: '96%',
      width: width,
    }}
    {...props}
  />
);

// Content
const Body = styled.div({
  lineHeight: 1.4,
  padding: innerGutter,
});

// Dialog
// ------------------------------

type Props = {
  attachTo: HTMLElement,
  children: Node,
  component: ComponentType<*> | string,
  onClose: (*) => void,
  onKeyDown: (*) => void,
  width: number,
};

class ModalConfirm extends PureComponent<Props> {
  static defaultProps = {
    attachTo: document.body,
    component: 'div',
    width: 400,
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
      component,
      onClose,
      width,
      ...transitionProps
    } = this.props;

    return createPortal(
      <Fragment>
        <Fade {...transitionProps}>
          <Blanket isTinted isLight />
        </Fade>
        <SlideDown from="-24px" {...transitionProps}>
          <Positioner>
            <FocusTrap>
              <Dialog component={component} width={width}>
                <Body>{children}</Body>
              </Dialog>
            </FocusTrap>
            <ScrollLock />
          </Positioner>
        </SlideDown>
      </Fragment>,
      attachTo
    );
  }
}

export default withTransitionState(ModalConfirm);
