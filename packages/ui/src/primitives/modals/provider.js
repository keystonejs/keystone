// @flow

import React, { Fragment, type ComponentType } from 'react';
import { TransitionGroup } from 'react-transition-group';
import styled from 'react-emotion';
import { Gateway, GatewayDest, GatewayProvider } from 'react-gateway';

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

        <GatewayDest name="dialog" component={TransitionProvider} />
        <GatewayDest name="popout" component={TransitionProvider} />
        <GatewayDest name="dropdown" component={TransitionProvider} />
      </Fragment>
    </GatewayProvider>
  );
}
export const withModalGateway = (
  Component: ComponentType<*>,
  target: string
) => (props: *) => (
  <Gateway into={target}>
    <Component {...props} />
  </Gateway>
);
