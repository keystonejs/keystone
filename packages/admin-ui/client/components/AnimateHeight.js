import React, { Component, type Element } from 'react';
import NodeResolver from 'react-node-resolver';

const transition = 'height 220ms cubic-bezier(0.2, 0, 0, 1)';

type Props = { children: Element<*> };

export default class AnimateHeight extends Component<Props> {
  state = { height: this.props.initial };
  static defaultProps = {
    initial: 0,
  };
  getNode = ref => {
    this.setState({ height: ref ? ref.scrollHeight : this.props.initial });
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
