import React from 'react';
import { Transition, TransitionGroup } from 'react-transition-group';

export const transitionDurationMs = 220;
export const transitionDuration = `${transitionDurationMs}ms`;
export const transitionTimingFunction = 'cubic-bezier(0.2, 0, 0, 1)';

export const TransitionProvider = ({ children, isOpen, ...props }) => (
  <TransitionGroup component={null}>
    {isOpen ? (
      <Transition appear mountOnEnter unmountOnExit timeout={transitionDurationMs} {...props}>
        {state => children(state)}
      </Transition>
    ) : null}
  </TransitionGroup>
);

export const withTransitionState = Comp => ({
  isOpen,

  ...props
}) => {
  return (
    <TransitionProvider isOpen={Boolean(isOpen)}>
      {state => <Comp transitionState={state} {...props} />}
    </TransitionProvider>
  );
};

// ==============================
// Transitions
// ==============================

function makeTransitionBase(transitionProperty) {
  return { transitionProperty, transitionDuration, transitionTimingFunction };
}

export const fade = transitionState => ({
  ...makeTransitionBase('opacity'),

  opacity: {
    entering: 1,
    entered: 1,
    exiting: 0,
    exited: 0,
  }[transitionState],
});

// Slide Up
// ------------------------------

export const slideUp = transitionState => {
  const out = {
    opacity: 0,
    transform: 'scale(0.95) translate3d(0,20px,0)',
  };
  return {
    ...makeTransitionBase('opacity, transform'),
    ...{
      entering: { opacity: 1 },
      entered: { opacity: 1 },
      exiting: out,
      exited: out,
    }[transitionState],
  };
};

export const slideDown = (transitionState, { from = '-8px' } = {}) => {
  const out = {
    opacity: 0,
    transform: `translate3d(0,${from},0)`,
  };
  return {
    ...makeTransitionBase('opacity, transform'),
    ...{
      entering: { opacity: 1 },
      entered: { opacity: 1 },
      exiting: out,
      exited: out,
    }[transitionState],
  };
};

const fromMap = { left: '-100%', right: '100%' }; // NOTE: should be able to use $Keys<typeof fromMap>
export const slideInHorizontal = (transitionState, { slideInFrom }) => {
  const initial = fromMap[slideInFrom];
  return {
    ...makeTransitionBase('transform'),
    ...{
      entering: { transform: 'translate3d(0,0,0)' },
      entered: { transform: 'translate3d(0,0,0)' },
      exiting: { transform: `translate3d(${initial}, 0, 0)` },
      exited: { transform: `translate3d(${initial}, 0, 0)` },
    }[transitionState],
  };
};

export const zoomInDown = transitionState => {
  return {
    transformOrigin: 'top',
    transitionProperty: 'opacity, transform',
    transitionDuration,
    transitionTimingFunction,
    ...{
      entering: {
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
      },
      entered: {
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
      },
      exiting: {
        opacity: 0,
        transform: 'scale3d(0.33, 0.33, 0.33) translate3d(0, -100%, 0)',
      },
      exited: {
        opacity: 0,
        transform: 'scale3d(0.33, 0.33, 0.33) translate3d(0, -100%, 0)',
      },
    }[transitionState],
  };
};

export const springDown = transitionState => {
  return {
    transformOrigin: 'top',
    transitionProperty: 'opacity, transform',
    transitionDuration,
    transitionTimingFunction: 'cubic-bezier(0.2, 0, 0.16, 1.6)',
    ...{
      entering: {
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
      },
      entered: {
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
      },
      exiting: {
        opacity: 0,
        transform: 'scale(0.93) translate3d(0, -12px, 0)',
      },
      exited: {
        opacity: 0,
        transform: 'scale(0.93) translate3d(0, -12px, 0)',
      },
    }[transitionState],
  };
};
