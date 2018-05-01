// @flow

import React, { Component, Fragment, type Element, type Node } from 'react';
import { createPortal } from 'react-dom';
import styled from 'react-emotion';
import ScrollLock from 'react-scrolllock';

import FocusTrap, { type FocusTarget } from './FocusTrap';
import { Fade, SlideUp } from './transitions';
import { colors } from '../../theme';
import { alpha } from '../../theme/color-utils';

const outerGutter = 40;
const innerGutter = 20;

// Styled Components
// ------------------------------

const Blanket = styled.div({
  backgroundColor: alpha(colors.N90, 0.66),
  bottom: 0,
  left: 0,
  position: 'fixed',
  right: 0,
  top: 0,
  zIndex: 2,
});
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
  isOpen: boolean,
  onClose: (*) => void,
  onKeyDown: (*) => void,
  width?: number,
};

export default class ModalDialog extends Component<Props> {
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
      isOpen,
      onClose,
      width,
    } = this.props;

    return createPortal(
      <Fragment>
        <Fade in={isOpen}>
          <Blanket onClick={onClose} />
        </Fade>
        <SlideUp in={isOpen}>
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
        {isOpen ? <ScrollLock /> : null}
      </Fragment>,
      attachTo
    );
  }
}
