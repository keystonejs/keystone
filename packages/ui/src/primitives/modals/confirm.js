// @flow

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, PureComponent, type ComponentType, type Ref, type Node } from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import ScrollLock from 'react-scrolllock';

import { borderRadius } from '../../theme';
import FocusTrap from './FocusTrap';
import { Fade, ZoomInDown, withTransitionState } from './transitions';
import type { TransitionState } from './transitions';
import { Blanket } from './common';

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

type DialogElementProps = {
  component: ComponentType<*> | string,
  innerRef?: Ref<*>,
  width: number,
};
const Dialog = ({ component: Tag, innerRef, width, ...props }: DialogElementProps) => (
  <Tag
    ref={innerRef}
    role="alertdialog"
    css={{
      backgroundColor: 'white',
      borderBottomRightRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
      boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.175), 0 3px 8px rgba(0, 0, 0, 0.175)',
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
  transitionState: TransitionState,
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
    const { attachTo, children, component, onClose, width, ...transitionProps } = this.props;

    return createPortal(
      <Fragment>
        <Fade {...transitionProps}>
          <Blanket isTinted isLight />
        </Fade>
        <ZoomInDown {...transitionProps}>
          <Positioner>
            <FocusTrap>
              <Dialog component={component} width={width}>
                <Body>{children}</Body>
              </Dialog>
            </FocusTrap>
            <ScrollLock />
          </Positioner>
        </ZoomInDown>
      </Fragment>,
      attachTo
    );
  }
}

export default withTransitionState(ModalConfirm);
