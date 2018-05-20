// @flow

import React, { Component, Fragment } from 'react';
import { Container, Subscribe, Provider } from 'unstated';

type State = { children: Array<Node> };

class GatewayState extends Container<State> {
  state = { containers: {} };
  addContainer = id => {
    const containers = { ...this.state.containers };
    containers[id] = null;

    this.setState({ containers });
  };
  removeContainer = id => {
    const containers = { ...this.state.containers };
    delete containers[id];

    this.setState({ containers });
  };
  setChildren = (id, children) => {
    const containers = { ...this.state.containers };
    containers[id] = children;

    this.setState({ containers });
    if (containers[id] !== this.state.containers[id]) {
    }
  };
}

type Props = {
  children: Node,
  setChildren: (string, Node) => void,
  id: string,
};

const withGateway = Comp => (props: Props) => (
  <Subscribe to={[GatewayState]}>
    {state => <Comp {...props} {...state} />}
  </Subscribe>
);

class StoreChildren extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return nextProps.children !== this.props.children;
  }
  componentDidMount() {
    const { children, id } = this.props;
    this.props.setChildren(id, children);
  }
  componentWillUpdate(nextProps: Props) {
    const { children, id } = nextProps;
    this.props.setChildren(id, children);
  }
  componentWillUnmount() {
    const { id } = this.props;
    this.props.setChildren(id, null);
  }
  render() {
    return null;
  }
}

export class RenderChildren extends Component<*> {
  componentDidMount() {
    this.props.addContainer(this.props.id);
  }
  componentWillUnmount() {
    this.props.removeContainer(this.props.id);
  }
  render() {
    const { component: Comp = Fragment, id, ...props } = this.props;
    return (
      <Subscribe to={[GatewayState]}>
        {({ state }) => {
          if (state.containers[id] !== undefined) {
            console.log(`${id} children`, state.containers[id]);
          }
          return <Comp {...props}>{state.containers[id]}</Comp>;
        }}
      </Subscribe>
    );
  }
}

export const Gateway = withGateway(StoreChildren);
export const GatewayContainer = withGateway(RenderChildren);
export const GatewayProvider = Provider;
