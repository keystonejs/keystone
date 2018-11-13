import React, { Component, createRef, Fragment } from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';

import { TransitionProvider, Fade } from './transitions';
import { borderRadius, colors, gridSize } from '../../theme';

function getOffset({ left, top }, placement) {
  const offset = gridSize / 2;
  let x = left;
  let y = top;

  if (placement === 'top') y -= offset;
  else if (placement === 'bottom') y += offset;
  else if (placement === 'left') x -= offset;
  else if (placement === 'right') x += offset;

  return {
    transform: `translate3d(${x}px, ${y}px, 0px)`,
  }
}

const TooltipElement = styled.div({
  backgroundColor: colors.N80,
  borderRadius: 3,
  color: 'white',
  fontSize: '0.85rem',
  left: 0,
  padding: `${gridSize / 2}px ${gridSize}px`,
  position: 'fixed',
  top: 0,
  zIndex: 2,
});

class TooltipPositioner extends Component {
  state = { left: 0, top: 0 }
  ref = createRef();
  componentDidMount() {
    this.calculatePosition();
  }
  calculatePosition = () => {
    const { placement, targetNode } = this.props;

    // prepare common values
    const tooltipRect = this.ref.current.getBoundingClientRect();
    const targetRect = targetNode.getBoundingClientRect();
    let left, top;

    const targetCenter = {
      x: targetRect.left + targetRect.width / 2,
      y: targetRect.top + targetRect.height / 2,
    };

    // set left and top offsets
    if (placement === 'left' || placement === 'right') top = targetCenter.y - tooltipRect.height / 2;
    if (placement === 'top' || placement === 'bottom') left = targetCenter.x - tooltipRect.width / 2;
    if (placement === 'left') left = targetRect.left - tooltipRect.width;
    if (placement === 'right') left = targetRect.right;
    if (placement === 'top') top = targetRect.top - tooltipRect.height;
    if (placement === 'bottom') top = targetRect.bottom;

    this.setState({ left, top });
  }
  render() {
    const { children, placement, style } = this.props;

    if (!document.body) return null;

    const styles = {
      ...style,
      ...getOffset(this.state, placement)
    }

    return createPortal(
      <TooltipElement ref={this.ref} style={styles}>
        {children}
      </TooltipElement>,
      document.body
    );
  }
};

export default class Tooltip extends Component {
  state = { isOpen: false }
  ref = createRef();
  static defaultProps = {
    placement: 'top',
  }
  componentDidMount() {
    if (!this.ref.current) {
      throw new Error('You must pass the ref onto your target node.');
    }
    if (!this.ref.current.nodeName) {
      throw new Error('It looks like you\'ve passed the ref onto a component. You must pass the ref onto your target node.');
    }

    this.ref.current.addEventListener('mouseenter', this.handleMouseEnter, { passive: true });
    this.ref.current.addEventListener('mouseleave', this.handleMouseLeave, { passive: true });
  };
  componentWillUnmount() {
    this.ref.current.removeEventListener('mouseenter', this.handleMouseEnter, { passive: true });
    this.ref.current.removeEventListener('mouseleave', this.handleMouseLeave, { passive: true });
  };
  handleMouseEnter = () => {
    this.setState({ isOpen: true });
  };
  handleMouseLeave = () => {
    this.setState({ isOpen: false });
  };
  render() {
    const { children, content, placement } = this.props;
    const { isOpen } = this.state;
    const ref = this.ref;

    return (
      <Fragment>
        {children(ref)}

        <TransitionProvider isOpen={isOpen}>
          {transitionState => (
            <Fade transitionState={transitionState}>
              <TooltipPositioner targetNode={this.ref.current} placement={placement}>
                {content}
              </TooltipPositioner>
            </Fade>
          )}
        </TransitionProvider>
      </Fragment>
    );
  }
}
