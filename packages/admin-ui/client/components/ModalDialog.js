// @flow

import React, { PureComponent, type Node } from 'react';
import { Container, Provider, Subscribe } from 'unstated';
import { TransitionGroup } from 'react-transition-group';

import { Dialog } from '@voussoir/ui/src/primitives/modals';

// ==============================
// Dialog Proxy
// ==============================

const withUtils = (WrappedComponent: any) => (props: any) => (
  <Subscribe to={[ModalState]}>
    {modalUtils => <WrappedComponent {...props} modalUtils={modalUtils} />}
  </Subscribe>
);

class DialogProxy extends PureComponent<*> {
  componentDidMount() {
    const { modalUtils, ...rest } = this.props;
    modalUtils.setActiveDialog(<Dialog {...rest} />);
  }
  componentWillUnmount() {
    const { modalUtils } = this.props;
    modalUtils.setActiveDialog(null);
  }
  render() {
    return null;
  }
}

export const ModalDialog = withUtils(DialogProxy);

// ==============================
// Unstated Setup
// ==============================

type Props = { children: Node };
type State = { activeDialog: Node };

class ModalState extends Container<State> {
  state = { activeDialog: null };
  setActiveDialog = activeDialog => {
    this.setState({ activeDialog });
  };
}

export const ModalProvider = ({ children }: Props) => (
  <Provider>
    {children}

    <Subscribe to={[ModalState]}>
      {({ state }) => <TransitionGroup component={null}>{state.activeDialog}</TransitionGroup>}
    </Subscribe>
  </Provider>
);
