/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, forwardRef, memo, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import ScrollLock from 'react-scrolllock';

import FocusTrap from 'focus-trap-react';
import {
  Blanket,
  fade,
  slideInHorizontal,
  withTransitionState,
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
}) => {
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

const Dialog = forwardRef(({ component: Tag, ...props }, ref) => (
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

function useKeydownHandler(handler) {
  let handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });
  useEffect(() => {
    function handle(event) {
      handlerRef.current(event);
    }
    document.addEventListener('keydown', handle, false);
    return () => {
      document.removeEventListener('keydown', handle, false);
    };
  }, []);
}

function ModalDialogComponent({
  attachTo = typeof document !== 'undefined' ? document.body : null,
  children,
  closeOnBlanketClick = false,
  component = 'div',
  footer,
  heading,
  initialFocus,
  onClose,
  slideInFrom,
  width = 640,
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

  if (!attachTo) {
    return null;
  }

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
          focusTrapOptions={{
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
            <ScrollLock>
              <Body>{children}</Body>
            </ScrollLock>
            {footer ? <Footer>{footer}</Footer> : null}
          </Dialog>
        </FocusTrap>
      </Positioner>
    </Fragment>,
    attachTo
  );
}

const ModalDialog = memo(ModalDialogComponent);

export default withTransitionState(ModalDialog);
