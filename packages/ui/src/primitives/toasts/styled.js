// @flow

import React, { Component } from 'react';
import styled, { keyframes } from 'react-emotion';
import { CheckIcon, FlameIcon, InfoIcon, XIcon } from '@keystonejs/icons';
import { Transition, TransitionGroup } from 'react-transition-group';

import { borderRadius, colors, gridSize } from '../../theme';
import { A11yText } from '../typography';

const autoDismissDuration = 5000;
const shrink = keyframes`from { height: 100%; } to { height: 0% }`;

const appearances = {
  success: {
    icon: CheckIcon,
    text: colors.G.D40,
    fg: colors.G.base,
    bg: colors.G.L70,
  },
  error: {
    icon: FlameIcon,
    text: colors.R.D40,
    fg: colors.R.base,
    bg: colors.R.L70,
  },
  info: {
    icon: InfoIcon,
    text: colors.N60,
    fg: colors.B.L20,
    bg: 'white',
  },
};

const Button = styled.div({
  cursor: 'pointer',
  flexShrink: 0,
  opacity: 0.5,
  padding: `${gridSize}px ${gridSize * 1.5}px`,
  transition: 'opacity 150ms',

  ':hover': { opacity: 1 },
});

const Content = styled.div({
  flexGrow: 1,
  fontSize: 14,
  lineHeight: 1.4,
  minHeight: 60,
  padding: `${gridSize}px ${gridSize * 1.5}px`,
});
const Countdown = styled.div({
  animation: `${shrink} ${autoDismissDuration}ms linear`,
  backgroundColor: 'rgba(0,0,0,0.1)',
  bottom: 0,
  height: 0,
  left: 0,
  position: 'absolute',
  width: '100%',
});
const Icon = ({ appearance, autoDismiss }) => {
  const meta = appearances[appearance];
  const Glyph = meta.icon;

  return (
    <div
      css={{
        backgroundColor: meta.fg,
        borderTopLeftRadius: borderRadius,
        borderBottomLeftRadius: borderRadius,
        color: meta.bg,
        flexShrink: 0,
        padding: gridSize,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {autoDismiss ? <Countdown /> : null}
      <Glyph css={{ position: 'relative', zIndex: 1 }} />
    </div>
  );
};
const toastStates = {
  entering: { transform: 'translate3d(110%,0,0)' },
  entered: { transform: 'translate3d(0,0,0)' },
  exiting: { transform: 'translate3d(110%,0,0)' },
  exited: { transform: 'translate3d(110%,0,0)' },
};
const transitionDurationMs = 220;
const transitionDuration = `${transitionDurationMs}ms`;
const ToastElement = styled.div(({ appearance, transitionState }) => ({
  backgroundColor: appearances[appearance].bg,
  borderRadius,
  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.175)',
  color: appearances[appearance].text,
  display: 'flex',
  marginBottom: gridSize,
  transition: `transform ${transitionDuration} cubic-bezier(0.2, 0, 0, 1)`,
  width: 360,
  ...toastStates[transitionState],
}));
export const ToastContainer = ({ children }: *) => (
  <div
    css={{
      maxHeight: '100%',
      overflowY: 'auto',
      padding: gridSize,
      position: 'fixed',
      right: 0,
      top: 0,
    }}
  >
    <TransitionGroup>{children}</TransitionGroup>
  </div>
);

export class Toast extends Component<*> {
  timeout: number;
  componentDidMount() {
    const { autoDismiss, onDismiss } = this.props;
    if (autoDismiss) {
      this.timeout = setTimeout(onDismiss, autoDismissDuration);
    }
  }
  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
  render() {
    const {
      appearance,
      autoDismiss,
      children,
      onDismiss,
      ...props
    } = this.props;

    return (
      <Transition
        appear
        mountOnEnter
        unmountOnExit
        timeout={transitionDurationMs}
        {...props}
      >
        {state => (
          <ToastElement appearance={appearance} transitionState={state}>
            <Icon appearance={appearance} autoDismiss={autoDismiss} />
            <Content>{children}</Content>
            {onDismiss ? (
              <Button onClick={onDismiss} role="button">
                <XIcon />
                <A11yText>Close</A11yText>
              </Button>
            ) : null}
          </ToastElement>
        )}
      </Transition>
    );
  }
}

Toast.defaultProps = {
  autoDismiss: false,
  appearance: 'success',
};
