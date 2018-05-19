// @flow

import React, { Fragment, type ComponentType } from 'react';
import { TransitionGroup } from 'react-transition-group';
import styled from 'react-emotion';
import { Gateway, GatewayDest, GatewayProvider } from 'react-gateway';

const LayerEnforcer = styled.div({
  position: 'relative',
  zIndex: 0,
});

type Props = { children: Node };

const TransitionProvider = props => (
  <TransitionGroup
    appear
    component={null}
    mountOnEnter
    unmountOnExit
    {...props}
  />
);

export default function ModalProvider({ children }: Props) {
  return (
    <GatewayProvider>
      <Fragment>
        <LayerEnforcer>{children}</LayerEnforcer>

        <GatewayDest name="dialog" component={TransitionProvider} />
        <GatewayDest name="popout" component={TransitionProvider} />
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
