// @flow

/** @jsx jsx */
import { jsx } from '@emotion/core';
import {
  Fragment,
  forwardRef,
  type ComponentType,
  type Element,
  type Node,
  memo,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import ScrollLock from 'react-scrolllock';

import { FocusTrap, type FocusTarget } from 'react-focus-marshal';
import {
  Blanket,
  fade,
  slideInHorizontal,
  withTransitionState,
  type TransitionState,
  generateUEID,
} from '@arch-ui/modal-utils';
import { borderRadius, colors, gridSize, shadows } from '@arch-ui/theme';
import { alpha } from '@arch-ui/color-utils';
import { A11yText, Title } from '@arch-ui/typography';
import { useStackIndex } from './stacks';

const innerGutter = gridSize * 2;

// Styled Components
// ------------------------------

const Positioner = ({
  slideInFrom,
  width,
  stackIndex,
  style: { transform, ...style },
  ...props
}: // using any because the transition component uses cloneElement to add the style prop
// TODO: different api for transitions
// could probably just be a function that accepts the transitionState and returns the style
any) => {
  const stackTransforms =
    stackIndex <= 0
      ? []
      : [`translate(calc(${stackIndex * 0.3} * -9vw))`, `scale(${1 - stackIndex / 50})`];

  return (
    <div
      css={{
        boxSizing: 'border-box',
        padding: gridSize,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxWidth: '90%',
        position: 'fixed',
        [slideInFrom]: 0,
        top: 0,
        width,
        zIndex: 2,
        transform: `${transform}${stackTransforms.join(' ')}`,
        ...style,
      }}
      {...props}
    />
  );
};

type DialogElementProps = {
  component: ComponentType<*> | string,
};

const Dialog = forwardRef(({ component: Tag, ...props }: DialogElementProps, ref) => (
  <Tag
    ref={ref}
    role="dialog"
    css={{
      backgroundColor: 'white',
      boxShadow: shadows[3],
      borderRadius: borderRadius * 2,
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      // margin: gridSize,
      maxHeight: '100%',
    }}
    {...props}
  />
));

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
  isOpen: boolean,
  component: ComponentType<*> | string,
  footer?: Element<*>,
  heading?: string,
  initialFocus?: FocusTarget,
  onClose: (*) => void,
  onKeyDown: (*) => void,
  slideInFrom: 'left' | 'right',
  transitionState: TransitionState,
  width: number,
};

function useKeydownHandler(handler) {
  let handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });
  useEffect(() => {
    function handle(event: KeyboardEvent) {
      // $FlowFixMe flow's definition of useRef is wrong
      handlerRef.current(event);
    }
    document.addEventListener('keydown', handle, false);
    return () => {
      document.removeEventListener('keydown', handle, false);
    };
  }, []);
}

let ModalDialog = memo<Props>(function ModalDialog({
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
  onKeyDown,
  transitionState,
  isOpen,
}) {
  let stackIndex = useStackIndex(
    transitionState === 'entered' || transitionState === 'entering',
    slideInFrom
  );
  useKeydownHandler(event => {
    if (onKeyDown && stackIndex === 0) {
      onKeyDown(event);
    }
  });
  const dialogTitleId = useMemo(generateUEID, []);

  return createPortal(
    <Fragment>
      {isOpen ? (
        <Blanket
          style={fade(transitionState)}
          onClick={closeOnBlanketClick ? onClose : undefined}
          isTinted
        />
      ) : null}
      <Positioner
        style={slideInHorizontal(transitionState, { slideInFrom })}
        slideInFrom={slideInFrom}
        width={width}
        stackIndex={stackIndex}
      >
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
      <ScrollLock />
    </Fragment>,
    attachTo
  );
});

// $FlowFixMe
ModalDialog.defaultProps = {
  attachTo: ((document.body: any): HTMLElement),
  closeOnBlanketClick: false,
  component: 'div',
  width: 640,
};

export default withTransitionState(ModalDialog);
