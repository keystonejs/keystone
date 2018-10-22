// @flow

import React, { Component, type Element, type Ref, type Node } from 'react';
import NodeResolver from 'react-node-resolver';

const transition = 'height 220ms cubic-bezier(0.2, 0, 0, 1)';

type Height = number | string;
type Props = {
  autoScroll: boolean | HTMLElement,
  children?: Element<*>,
  initialHeight: Height,
  onChange?: Height => any,
  render?: ({ ref: Ref<*> }) => Node,
};
type State = { height: Height, isTransitioning: boolean };

export default class AnimateHeight extends Component<Props, State> {
  node: HTMLElement;
  state = { height: this.props.initialHeight, isTransitioning: false };
  static defaultProps = {
    autoScroll: false,
    initialHeight: 0,
  };
  getNode = (ref: HTMLElement | null) => {
    if (!ref) return;
    this.node = ref;
    this.calculateHeight();
  };
  scrollToTop = () => {
    const { autoScroll } = this.props;
    const element = autoScroll instanceof HTMLElement ? autoScroll : this.node;
    if (
      !element ||
      // $FlowFixMe
      typeof element.scrollTo !== 'function'
    ) {
      return;
    }
    element.scrollTo(0, 0);
  };
  calculateHeight = () => {
    const { autoScroll, initialHeight, onChange } = this.props;
    const height = this.node ? this.node.scrollHeight : initialHeight;

    this.setState({ isTransitioning: true });

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
    const { autoScroll, children, initialHeight, render, ...props } = this.props;
    const { height, isTransitioning } = this.state;
    const overflow = isTransitioning ? 'hidden' : null;

    return (
      <div
        css={{ height, transition, overflow }}
        onTransitionEnd={() => this.setState({ isTransitioning: false })}
        {...props}
      >
        {render ? (
          render({ ref: this.getNode, recalcHeight: this.calculateHeight })
        ) : (
          <NodeResolver innerRef={this.getNode}>{children}</NodeResolver>
        )}
      </div>
    );
  }
}
