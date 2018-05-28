// @flow

import React, { PureComponent, Fragment, type Element, type Node } from 'react';
import { createPortal } from 'react-dom';
import styled from 'react-emotion';
import ScrollLock from 'react-scrolllock';

import FocusTrap, { type FocusTarget } from './FocusTrap';
import { Fade, SlideUp, withTransitionState } from './transitions';
import { Blanket } from './common';
import { colors } from '../../theme';
import { alpha } from '../../theme/color-utils';
import { A11yText } from '../misc';

const outerGutter = 40;
const innerGutter = 20;

// Styled Components
// ------------------------------

const Positioner = styled.div(({ width }) => ({
  display: 'flex',
  flexDirection: 'column',
  left: 0,
  marginLeft: 'auto',
  marginRight: 'auto',
  maxHeight: `calc(100% - ${outerGutter * 2}px)`,
  maxWidth: width,
  position: 'fixed',
  right: 0,
  top: outerGutter,
  zIndex: 2,
}));
const Dialog = styled.div({
  backgroundColor: 'white',
  borderRadius: 5,
  boxShadow: '0 2px 8px -1px rgba(0,0,0,0.3)',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  maxHeight: '100%',
});

// Content

const HeadFoot = styled.div({
  lineHeight: 1,
  margin: `0 ${innerGutter}px`,
  paddingBottom: innerGutter,
  paddingTop: innerGutter,

  // ensure that box-shadow covers body content
  position: 'relative',
  zIndex: 1,
});
const Header = styled(HeadFoot)({
  boxShadow: `0 2px 0 ${alpha(colors.text, 0.12)}`,
});
const Footer = styled(HeadFoot)({
  boxShadow: `0 -2px 0 ${alpha(colors.text, 0.12)}`,
});
const Title = styled.h3({
  fontSize: 18,
  fontWeight: 500,
  margin: 0,
});
const Body = styled.div({
  lineHeight: 1.4,
  overflowY: 'auto',
  padding: innerGutter,
});

// Dialog
// ------------------------------

type Props = {
  attachTo: HTMLElement,
  children: Node,
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
      footer,
      heading,
      initialFocus,
      onClose,
      width,
      ...transitionProps
    } = this.props;

    return createPortal(
      <Fragment>
        <Fade {...transitionProps}>
          <Blanket onClick={onClose} isTinted />
        </Fade>
        <SlideUp {...transitionProps}>
          <Positioner width={width}>
            <FocusTrap options={{ initialFocus }}>
              <Dialog>
                <A11yText>{heading} Dialog</A11yText>
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
