// @flow

import React, {
  cloneElement,
  Component,
  Fragment,
  type ComponentType,
} from 'react';
import { TransitionGroup } from 'react-transition-group';
import styled from 'react-emotion';

import { GatewayContainer, Gateway, GatewayProvider } from './gateway';

// NOTE: App Wrapper
// Lock the app in a 0 z-index container. Allows all gateways to render
// hierarchically, on top of the app, without needing incremental z-indexes.
const AppWrapper = styled.div({
  position: 'relative',
  zIndex: 0,
});

type State = { hasExited: boolean };
class TransitionProvider extends Component<*, State> {
  state = { hasExited: false };
  onExited = () => {
    this.setState({ hasExited: true });
  };
  // HACK: force transition group children unmount
  componentDidUpdate(prevProps, prevState) {
    if (!prevState.hasExited && this.state.hasExited) {
      this.setState({ hasExited: false }); // eslint-disable-line
    }
  }
  render() {
    const { hasExited } = this.state;

    return (
      <TransitionGroup
        appear
        component={null}
        childFactory={c => {
          const child = cloneElement(c, { onExited: this.onExited });

          return hasExited ? null : child;
        }}
        {...this.props}
      />
    );
  }
}

type ProviderProps = { children: Node };

export default function ModalProvider({ children }: ProviderProps) {
  return (
    <GatewayProvider>
      <Fragment>
        <AppWrapper>{children}</AppWrapper>

        <GatewayContainer id="dialog" component={TransitionProvider} />
        <GatewayContainer id="popout" component={TransitionProvider} />
        <GatewayContainer id="dropdown" component={TransitionProvider} />
      </Fragment>
    </GatewayProvider>
  );
}
export const withModalGateway = (
  Component: ComponentType<*>,
  target: string
) => (props: *) => (
  <Gateway id={target}>
    <Component {...props} />
  </Gateway>
);
