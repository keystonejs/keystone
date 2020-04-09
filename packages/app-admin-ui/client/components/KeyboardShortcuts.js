import React, { createContext, useContext } from 'react';

const KeyboardContext = createContext();

const LISTENER_OPTIONS = {
  capture: true,
  once: false,
  passive: true,
};

export default class KeyboardShortcuts extends React.Component {
  listeners = {};

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown, LISTENER_OPTIONS);
    document.addEventListener('keyup', this.onKeyUp, LISTENER_OPTIONS);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown, LISTENER_OPTIONS);
    document.removeEventListener('keyup', this.onKeyUp, LISTENER_OPTIONS);
  }

  subscribe = (key, callback) => {
    if (this.listeners[key]) {
      throw new Error(`There is already a listener subscribed to the key "${key}"`);
    }

    this.listeners[key] = callback;
  };
  unsubscribe = key => {
    if (!this.listeners[key]) {
      throw new Error(`There is no listener subscribed to the key "${key}"`);
    }

    delete this.listeners[key];
  };

  onKeyDown = event => {
    // bail if there's already a keydown
    if (this.keyIsDown) return;

    // setup
    this.keyIsDown = true;
    const { nodeName, isContentEditable } = document.activeElement;

    // bail if the user is focused on an input element
    if (nodeName === 'INPUT' || nodeName === 'TEXTAREA' || isContentEditable) {
      return;
    }

    // call any applicable listeners
    if (this.listeners[event.key]) {
      this.listeners[event.key](event);
    }
  };
  onKeyUp = () => {
    this.keyIsDown = false;
  };

  render() {
    const value = {
      subscribe: this.subscribe,
      unsubscribe: this.unsubscribe,
    };

    return <KeyboardContext.Provider value={value}>{this.props.children}</KeyboardContext.Provider>;
  }
}

export const KeyboardConsumer = ({ children }) => (
  <KeyboardContext.Consumer>{ctx => children(ctx)}</KeyboardContext.Consumer>
);

export const withKeyboardConsumer = Comp => props => (
  <KeyboardConsumer>{context => <Comp keyManager={context} {...props} />}</KeyboardConsumer>
);

export const useKeyboardManager = () => {
  const { subscribe, unsubscribe } = useContext(KeyboardContext);
  return { addBinding: subscribe, removeBinding: unsubscribe };
};
