// @flow

import React, { Component, type Element } from 'react';
import NodeResolver from 'react-node-resolver';

const transition = 'height 220ms cubic-bezier(0.2, 0, 0, 1)';

type Height = number | string;
type Props = {
  children: Element<*>,
  initial: Height,
  onChange?: Height => any,
};
type State = { height: Height };

export default class AnimateHeight extends Component<Props, State> {
  state = { height: this.props.initial };
  static defaultProps = {
    initial: 0,
  };
  getNode = ref => {
    const { initial, onChange } = this.props;
    const height = ref ? ref.scrollHeight : initial;

    if (height !== this.state.height) {
      this.setState({ height });
    }
    if (onChange) {
      onChange(height);
    }
  };
  render() {
    const { children } = this.props;
    const { height } = this.state;

    return (
      <div css={{ height, transition }} {...this.props}>
        <NodeResolver innerRef={this.getNode}>{children}</NodeResolver>
      </div>
    );
  }
}
