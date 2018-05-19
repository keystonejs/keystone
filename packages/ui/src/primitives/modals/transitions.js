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
  transitionStates: {
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
      transitionStates,
      transitionProps,
    } = this.props;

    return (
      <Transition
        in={inProp}
        timeout={transitionDurationMs}
        {...transitionProps}
      >
        {state => {
          const style = {
            ...defaultStyles,
            ...transitionStates[state],
          };

          // console.log('state', state);

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
    transitionStates={{
      entering: { opacity: 1 },
      entered: { opacity: 1 },
      exited: { opacity: 0 },
      exiting: { opacity: 0 },
    }}
    {...props}
  />
);

export const SlideUp = (props: TransitionProps) => {
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
      transitionStates={{
        entering: { opacity: 1 },
        entered: { opacity: 1 },
        exiting: out,
        exited: out,
      }}
      {...props}
    />
  );
};

export const SlideDown = (props: TransitionProps) => {
  const out = {
    opacity: 0,
    transform: 'translate3d(0,-8px,0)',
  };
  return (
    <TransitionHandler
      defaultStyles={{
        transitionProperty: 'opacity, transform',
        transitionDuration,
        transitionTimingFunction,
        opacity: 0,
      }}
      transitionStates={{
        entering: { opacity: 1, transform: 'translate3d(0,0,0)' },
        entered: { opacity: 1, transform: 'translate3d(0,0,0)' },
        exiting: out,
        exited: out,
      }}
      {...props}
    />
  );
};
