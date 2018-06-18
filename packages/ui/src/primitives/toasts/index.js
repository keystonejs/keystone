// @flow

import React, { Component, type ComponentType, type Node } from 'react';

import { generateUEID } from '../../utils';
import { Toast, ToastContainer } from './styled';
import type { Callback, Id, Options, ToastsType } from './types';

const { Consumer, Provider } = React.createContext();
const NOOP = () => {};

// Provider
// ==============================

type Props = {
  children: Node,
  cache?: Cache,
};
type State = { toasts: ToastsType };

export class ToastProvider extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { toasts: [] };
  }
  addToast = (content: Node, options?: Options = {}) => (cb: Callback) => {
    const id = generateUEID();
    const callback = cb ? () => cb(id) : NOOP;

    this.setState(state => {
      const toasts = state.toasts.slice(0);
      const toast = Object.assign({}, { content, id }, options);

      toasts.push(toast);

      return { toasts };
    }, callback);
  };
  removeToast = (id: Id) => (cb: Callback) => {
    const callback = cb ? () => cb(id) : NOOP;

    this.setState(state => {
      const toasts = state.toasts.filter(t => t.id !== id);
      return { toasts };
    }, callback);
  };

  render() {
    const { toasts } = this.state;
    const { addToast, removeToast } = this;

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
