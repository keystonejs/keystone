// @flow

import React, { Children, Component, Fragment, PureComponent } from 'react';
import { Container, Subscribe, Provider } from 'unstated';

function uniqueId() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

type Props = {
  children: ChildrenType,
  setChildren: (string, ChildrenType) => void,
  id: string,
};

type ChildrenType = Node | Array<Node> | null;
type State = { containers: { [key: string]: ChildrenType } };

// GatewayState
// ----------------
// simple store, holds various containers and their respective children

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
  };
}

// Helper HoC for hoisting Container state outside of the Subscribe render

const withGateway = Comp => (props: Props) => (
  <Subscribe to={[GatewayState]}>
    {state => <Comp {...props} {...state} />}
  </Subscribe>
);

// Gateway
// -------
// take the children from from `props` and store them in `state`

class StoreChildren extends Component<Props> {
  itemId = uniqueId();
  shouldComponentUpdate(nextProps: Props) {
    return nextProps.children !== this.props.children;
  }
  setChildren = ({ children, id }) => {
    const key = this.itemId;
    const kids = Children.map(children, child => ({ ...child, key }));

    this.props.setChildren(id, kids);
  };
  componentDidMount() {
    this.setChildren(this.props);
  }
  componentDidUpdate(prevProps: Props) {
    this.setChildren(prevProps);
  }
  componentWillUnmount() {
    const { id } = this.props;
    this.setChildren({ children: null, id });
  }
  render() {
    return null;
  }
}

// GatewayContainer
// ----------------
// take the children from `state` and render to the desired location

export class RenderChildren extends PureComponent<*> {
  static defaultProps = {
    component: Fragment,
  };
  componentDidMount() {
    this.props.addContainer(this.props.id);
  }
  componentWillUnmount() {
    this.props.removeContainer(this.props.id);
  }
  render() {
    const { component: Comp, id, ...props } = this.props;
    return (
      <Subscribe to={[GatewayState]}>
        {({ state }) => {
          const children = state.containers[id];
          return <Comp {...props}>{children}</Comp>;
        }}
      </Subscribe>
    );
  }
}

export const Gateway = withGateway(StoreChildren);
export const GatewayContainer = withGateway(RenderChildren);
export const GatewayProvider = Provider;
