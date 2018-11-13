// @flow

import React, { Component, createRef, Fragment, type Ref, type Node } from 'react';
import { createPortal } from 'react-dom';
import flushable from 'flushable';
import styled from '@emotion/styled';

import { TransitionProvider, Fade } from './transitions';
import { colors, gridSize } from '../../theme';

function getOffset({ left, top }, placement) {
  let x = left;
  let y = top;

  if (placement === 'top') y -= gridSize;
  else if (placement === 'bottom') y += gridSize;
  else if (placement === 'left') x -= gridSize;
  else if (placement === 'right') x += gridSize;

  return {
    transform: `translate3d(${x}px, ${y}px, 0px)`,
  };
}

const TooltipElement = styled.div({
  backgroundColor: colors.N80,
  borderRadius: 3,
  color: 'white',
  fontSize: '0.75rem',
  fontWeight: 500,
  left: 0,
  padding: `${gridSize / 2}px ${gridSize}px`,
  position: 'fixed',
  top: 0,
  zIndex: 2,
});

type PlacementType = 'top' | 'right' | 'bottom' | 'left';
type PositionerProps = {
  children: Node,
  placement: PlacementType,
  style?: Object,
  targetNode: HTMLElement,
};
type PositionerState = { left: number, top: number };

class TooltipPositioner extends Component<PositionerProps, PositionerState> {
  state = { left: 0, top: 0 };
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
    if (placement === 'left' || placement === 'right') {
      top = targetCenter.y - tooltipRect.height / 2;
    }
    if (placement === 'top' || placement === 'bottom') {
      left = targetCenter.x - tooltipRect.width / 2;
    }
    if (placement === 'left') left = targetRect.left - tooltipRect.width;
    if (placement === 'right') left = targetRect.right;
    if (placement === 'top') top = targetRect.top - tooltipRect.height;
    if (placement === 'bottom') top = targetRect.bottom;

    this.setState({ left, top });
  };
  render() {
    const { children, placement, style } = this.props;

    if (!document.body) return null;

    const styles = {
      ...style,
      ...getOffset(this.state, placement),
    };

    if (document.body) {
      return createPortal(
        <TooltipElement ref={this.ref} style={styles}>
          {children}
        </TooltipElement>,
        document.body
      );
    } else {
      return null;
    }
  }
}

const LISTENER_OPTIONS = { passive: true };
const NOOP = () => {};

let pendingHide;

const showTooltip = (fn: boolean => void, defaultDelay: number) => {
  const isHidePending = pendingHide && pendingHide.pending();
  if (isHidePending) {
    pendingHide.flush();
  }
  const pendingShow = flushable(() => fn(isHidePending), isHidePending ? 0 : defaultDelay);
  return pendingShow.cancel;
};

const hideTooltip = (fn: boolean => void, defaultDelay: number) => {
  pendingHide = flushable(flushed => fn(flushed), defaultDelay);
  return pendingHide.cancel;
};

type Props = {
  children: (Ref<HTMLElement>) => Node,
  content: Node,
  delay: number,
  hideOnMouseDown?: boolean,
  hideOnKeyDown?: boolean,
  onHide?: () => void,
  onShow?: () => void,
  placement: PlacementType,
};
type State = {
  immediatelyHide: boolean,
  immediatelyShow: boolean,
  isVisible: boolean,
};

export default class Tooltip extends Component<Props, State> {
  state = {
    immediatelyHide: false,
    immediatelyShow: false,
    isVisible: false,
  };
  ref = createRef();
  cancelPendingSetState = NOOP;
  static defaultProps = {
    delay: 300,
    placement: 'bottom',
  };
  componentDidMount() {
    if (!this.ref.current) {
      throw new Error('You must pass the ref onto your target node.');
    }
    if (!this.ref.current.nodeName) {
      throw new Error(
        "It looks like you've passed the ref onto a component. You must pass the ref onto your target node."
      );
    }

    if (this.ref && this.ref.current && this.ref.current instanceof HTMLElement) {
      this.ref.current.addEventListener('mouseenter', this.handleMouseEnter, LISTENER_OPTIONS);
      this.ref.current.addEventListener('mouseleave', this.handleMouseLeave, LISTENER_OPTIONS);
    }
  }
  componentWillUnmount() {
    this.cancelPendingSetState();

    if (this.ref && this.ref.current && this.ref.current instanceof HTMLElement) {
      this.ref.current.removeEventListener('mouseenter', this.handleMouseEnter, LISTENER_OPTIONS);
      this.ref.current.removeEventListener('mouseleave', this.handleMouseLeave, LISTENER_OPTIONS);
    }
  }

  cancel = () => {
    this.cancelPendingSetState();
    this.setState({ isVisible: false, immediatelyHide: true });
  };

  handleMouseEnter = () => {
    this.cancelPendingSetState();

    if (this.state.isVisible) {
      return;
    }
    if (this.props.hideOnMouseDown && this.ref.current) {
      this.ref.current.addEventListener('mousedown', this.cancel, LISTENER_OPTIONS);
    }
    if (this.props.hideOnKeyDown) {
      document.addEventListener('keydown', this.cancel, LISTENER_OPTIONS);
    }

    this.cancelPendingSetState = showTooltip(immediatelyShow => {
      this.setState({
        isVisible: true,
        immediatelyShow,
      });
    }, this.props.delay);
  };
  handleMouseLeave = () => {
    this.cancelPendingSetState();

    if (!this.state.isVisible) {
      return;
    }
    if (this.props.hideOnMouseDown && this.ref.current) {
      this.ref.current.removeEventListener('mousedown', this.cancel, LISTENER_OPTIONS);
    }
    if (this.props.hideOnKeyDown) {
      document.removeEventListener('keydown', this.cancel, LISTENER_OPTIONS);
    }

    this.cancelPendingSetState = hideTooltip(immediatelyHide => {
      this.setState({ isVisible: false, immediatelyHide });
    }, this.props.delay);
  };

  render() {
    const { children, content, onHide, onShow, placement } = this.props;
    const { isVisible } = this.state;
    const ref = this.ref;

    return (
      <Fragment>
        {children(ref)}

        <TransitionProvider isOpen={isVisible} onEntered={onShow} onExited={onHide}>
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
