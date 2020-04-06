/** @jsx jsx */

import { Fragment, PureComponent, forwardRef } from 'react';
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

class ModalConfirm extends PureComponent {
  static defaultProps = {
    attachTo: typeof document !== 'undefined' ? document.body : null,
    component: 'div',
    width: 400,
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
    const { attachTo, children, component, width, transitionState } = this.props;

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
}

export default withTransitionState(ModalConfirm);
