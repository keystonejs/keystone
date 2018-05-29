// @flow

import React, { Component, type ComponentType, type Node } from 'react';

import { Toast, ToastContainer } from './styled';
import type { AddFn, RemoveFn, ToastsType, Options } from './types';

const { Consumer, Provider } = React.createContext();

// Generate a unique enough ID
function generateUEID() {
  let first = (Math.random() * 46656) | 0;
  let second = (Math.random() * 46656) | 0;
  first = ('000' + first.toString(36)).slice(-3);
  second = ('000' + second.toString(36)).slice(-3);
  return first + second;
}

// Provider
// ==============================

type Props = {
  children: Node,
  cache?: Cache,
};
type State = {
  toasts: ToastsType,
  addToast: AddFn,
  removeToast: RemoveFn,
};

export class ToastProvider extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      toasts: [],
      addToast: this.addToast,
      removeToast: this.removeToast,
    };
  }
  addToast = (content: Node, options?: Options = {}) => () => {
    const toasts = this.state.toasts.slice(0);
    const { appearance, autoDismiss } = options;
    const id = generateUEID();

    toasts.push({ content, id, appearance, autoDismiss });

    this.setState({ toasts });
  };
  removeToast = (id: Id) => () => {
    const toasts = this.state.toasts.filter(t => t.id !== id);
    this.setState({ toasts });
  };

  render() {
    const { toasts, addToast, removeToast } = this.state;

    return (
      <Provider value={{ addToast, removeToast }}>
        {this.props.children}

        <ToastContainer>
          {toasts.map(({ content, id, ...rest }) => (
            <Toast key={id} onDismiss={this.removeToast(id)} {...rest}>
              {content}
            </Toast>
          ))}
        </ToastContainer>
      </Provider>
    );
  }
}

export const withToastUtils = (Comp: ComponentType<*>) => (props: *) => (
  <Consumer>{context => <Comp toast={context} {...props} />}</Consumer>
);
