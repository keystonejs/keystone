// @flow

import React, { Fragment, type ComponentType } from 'react';
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

const TransitionProvider = props => (
  <TransitionGroup appear component={null} {...props} />
);

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
