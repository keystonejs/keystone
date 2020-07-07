import React, { createContext, useEffect, useRef, useContext } from 'react';

const KeyboardContext = createContext();

const LISTENER_OPTIONS = {
  capture: true,
  once: false,
  passive: true,
};

export const KeyboardShortcutsProvider = ({ children }) => {
  const listeners = useRef({});
  const keyIsDown = useRef(false);

  const onKeyDown = event => {
    // bail if there's already a keydown
    if (keyIsDown.current) return;

    // setup
    keyIsDown.current = true;
    const { nodeName, isContentEditable } = document.activeElement;

    // bail if the user is focused on an input element
    if (nodeName === 'INPUT' || nodeName === 'TEXTAREA' || isContentEditable) {
      return;
    }

    // call any applicable listeners
    if (listeners.current[event.key]) {
      listeners.current[event.key](event);
    }
  };

  const onKeyUp = () => {
    keyIsDown.current = false;
  };

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown, LISTENER_OPTIONS);
    document.addEventListener('keyup', onKeyUp, LISTENER_OPTIONS);

    return () => {
      document.removeEventListener('keydown', onKeyDown, LISTENER_OPTIONS);
      document.removeEventListener('keyup', onKeyUp, LISTENER_OPTIONS);
    };
  }, []);

  const subscribe = (key, callback) => {
    if (listeners.current[key]) {
      throw new Error(`There is already a listener subscribed to the key "${key}"`);
    }

    listeners.current[key] = callback;
  };

  const unsubscribe = key => {
    if (!listeners.current[key]) {
      throw new Error(`There is no listener subscribed to the key "${key}"`);
    }

    delete listeners.current[key];
  };

  const value = {
    subscribe,
    unsubscribe,
  };

  return <KeyboardContext.Provider value={value}>{children}</KeyboardContext.Provider>;
};

export const useKeyboardManager = () => {
  const { subscribe, unsubscribe } = useContext(KeyboardContext);
  return { addBinding: subscribe, removeBinding: unsubscribe };
};
