// @flow
/** @jsx jsx */

import { PureComponent, type ComponentType, type Node, forwardRef } from 'react';
import ScrollLock from 'react-scrolllock';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';

import { borderRadius } from '@arch-ui/theme';
import { FocusTrap } from 'react-focus-marshal';
import {
  Fade,
  ZoomInDown,
  withTransitionState,
  type TransitionState,
  Blanket,
} from '@arch-ui/modal-utils';
import { UniversalPortal } from '@jesstelford/react-portal-universal';

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
  width: number,
};

const Dialog = forwardRef(({ component: Tag, width, ...props }: DialogElementProps, ref) => (
  <Tag
    ref={ref}
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
));

// Content
const Body = styled.div({
  lineHeight: 1.4,
  padding: innerGutter,
});

// Dialog
// ------------------------------

type Props = {
  attachTo: string,
  children: Node,
  component: ComponentType<*> | string,
  onClose?: (*) => void,
  onKeyDown: (*) => void,
  transitionState: TransitionState,
  width: number,
};

class ModalConfirm extends PureComponent<Props> {
  static defaultProps = {
    attachTo: 'body',
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

    return (
      <UniversalPortal selector={attachTo}>
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
      </UniversalPortal>
    );
  }
}

export default withTransitionState(ModalConfirm);
