// @flow

import React, { Component, type Element, type Ref, type Node } from 'react';
import NodeResolver from 'react-node-resolver';

const transition = 'height 220ms cubic-bezier(0.2, 0, 0, 1)';

type Height = number | string;
type Props = {
  autoScroll: boolean | HTMLElement,
  children?: Element<*>,
  initial: Height,
  onChange?: Height => any,
  render?: ({ ref: Ref<*> }) => Node,
};
type State = { height: Height };

export default class AnimateHeight extends Component<Props, State> {
  node: HTMLElement;
  state = { height: this.props.initial };
  static defaultProps = {
    autoScroll: false,
    initial: 0,
  };
  getNode = ref => {
    if (!ref) return;
    this.node = ref;
    this.calculateHeight();
  };
  scrollToTop = () => {
    const { autoScroll } = this.props;
    const element = autoScroll instanceof HTMLElement ? autoScroll : this.node;
    if (!element) return;
    element.scrollTo(0, 0);
  };
  calculateHeight = () => {
    const { autoScroll, initial, onChange } = this.props;
    const height = this.node ? this.node.scrollHeight : initial;

    if (height !== this.state.height) {
      this.setState({ height });
    }
    if (autoScroll) {
      this.scrollToTop();
    }
    if (onChange) {
      onChange(height);
    }
  };
  render() {
    const { autoScroll, children, render, ...props } = this.props;
    const { height } = this.state;

    return (
      <div css={{ height, transition }} {...props}>
        {render ? (
          render({ ref: this.getNode, recalcHeight: this.calculateHeight })
        ) : (
          <NodeResolver innerRef={this.getNode}>{children}</NodeResolver>
        )}
      </div>
    );
  }
}
