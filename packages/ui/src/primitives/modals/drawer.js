// @flow

/** @jsx jsx */
import { jsx } from '@emotion/core';
import {
  PureComponent,
  Fragment,
  type ComponentType,
  type Element,
  type Ref,
  type Node,
} from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import ScrollLock from 'react-scrolllock';

import FocusTrap, { type FocusTarget } from './FocusTrap';
import { Fade, SlideInHorizontal, withTransitionState } from './transitions';
import type { TransitionState } from './transitions';
import { Blanket } from './common';
import { colors } from '../../theme';
import { generateUEID } from '../../utils';
import { alpha } from '../../theme/color-utils';
import { A11yText } from '../typography';

const innerGutter = 20;

// Styled Components
// ------------------------------

const Positioner = styled.div(({ slideInFrom, width }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  maxWidth: '90%',
  position: 'fixed',
  [slideInFrom]: 0,
  top: 0,
  width: width,
  zIndex: 2,
}));

type DialogElementProps = {
  component: ComponentType<*> | string,
  innerRef?: Ref<*>,
};
const Dialog = ({ component: Tag, innerRef, ...props }: DialogElementProps) => (
  <Tag
    ref={innerRef}
    role="dialog"
    css={{
      backgroundColor: colors.page,
      boxShadow: '-2px 0 12px -1px rgba(0,0,0,0.3)',
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      maxHeight: '100%',
    }}
    {...props}
  />
);

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
  closeOnBlanketClick: boolean,
  component: ComponentType<*> | string,
  footer?: Element<*>,
  heading?: string,
  initialFocus?: FocusTarget,
  onClose: (*) => void,
  onKeyDown: (*) => void,
  slideInFrom: 'left' | 'right',
  transitionState: TransitionState,
  width?: number,
};

class ModalDialog extends PureComponent<Props> {
  static defaultProps = {
    attachTo: document.body,
    closeOnBlanketClick: false,
    component: 'div',
    width: 560,
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
      slideInFrom,
      width,
      ...transitionProps
    } = this.props;
    const dialogTitleId = generateUEID();

    return createPortal(
      <Fragment>
        <Fade {...transitionProps}>
          <Blanket onClick={closeOnBlanketClick ? onClose : undefined} isTinted />
        </Fade>
        <SlideInHorizontal slideInFrom={slideInFrom} {...transitionProps}>
          <Positioner slideInFrom={slideInFrom} width={width}>
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
        </SlideInHorizontal>
        <ScrollLock />
      </Fragment>,
      attachTo
    );
  }
}

export default withTransitionState(ModalDialog);
