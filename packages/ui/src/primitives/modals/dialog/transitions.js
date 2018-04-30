// @flow

import React, { cloneElement, PureComponent, type Element } from 'react';
import { Transition } from 'react-transition-group';

const transitionDurationMs = 220;
const transitionDuration = `${transitionDurationMs}ms`;
const transitionTimingFunction = 'cubic-bezier(0.2, 0, 0, 1)';

// Transitions
// ------------------------------

type Styles = { [string]: string | number };
type TransitionProps = {
  children: Element<*>,
  in: boolean,
};
type HandlerProps = {
  defaultStyles: Styles,
  transitionProps: {
    appear: boolean,
    mountOnEnter: boolean,
    unmountOnExit: boolean,
  },
  transitionStyles: {
    entering?: Styles,
    entered?: Styles,
    exiting?: Styles,
    exited?: Styles,
  },
};

class TransitionHandler extends PureComponent<HandlerProps & TransitionProps> {
  static defaultProps = {
    children: 'div',
    transitionProps: {
      appear: true,
      mountOnEnter: true,
      unmountOnExit: true,
    },
  };
  render() {
    const {
      children: Tag,
      in: inProp,
      defaultStyles,
      transitionStyles,
      transitionProps,
    } = this.props;
    const timeout = { enter: 0, exit: transitionDurationMs };

    return (
      <Transition in={inProp} timeout={timeout} {...transitionProps}>
        {state => {
          const style = {
            ...defaultStyles,
            ...transitionStyles[state],
          };

          if (state === 'exited') return null;

          return cloneElement(Tag, { style });
        }}
      </Transition>
    );
  }
}

export const Fade = (props: TransitionProps) => (
  <TransitionHandler
    defaultStyles={{
      transition: `opacity ${transitionDuration} ${transitionTimingFunction}`,
    }}
    transitionStyles={{
      exiting: { opacity: 0 },
      entering: { opacity: 0 },
      entered: { opacity: 1 },
    }}
    {...props}
  />
);

export const Slide = (props: TransitionProps) => {
  const out = {
    opacity: 0,
    transform: 'scale(0.95) translate3d(0,20px,0)',
  };
  return (
    <TransitionHandler
      defaultStyles={{
        transitionProperty: 'opacity, transform',
        transitionDuration,
        transitionTimingFunction,
        opacity: 0,
      }}
      transitionStyles={{
        entered: { opacity: 1, transform: 'translate3d(0,0,0)' },
        exiting: out,
        entering: out,
      }}
      {...props}
    />
  );
};
