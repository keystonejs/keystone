// @flow

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, createRef, Fragment, type Ref, type Node } from 'react';
import { createPortal } from 'react-dom';
import flushable from 'flushable';
import styled from '@emotion/styled';
import { Popper } from 'react-popper';

import { TransitionProvider, fade } from '@arch-ui/modal-utils';
import { colors, gridSize } from '@arch-ui/theme';

// ==============================
// Styled Component
// ==============================

const TooltipElement = styled.div({
  backgroundColor: colors.N80,
  borderRadius: 3,
  color: 'white',
  fontSize: '0.75rem',
  fontWeight: 500,
  padding: `${gridSize / 2}px ${gridSize}px`,
  pointerEvents: 'none', // tooltips are non-interactive, they shouldn't get in the way of other elements
  zIndex: 2,
});

type PlacementType = 'top' | 'right' | 'bottom' | 'left';
type PositionerProps = {
  children: Node,
  placement: PlacementType,
  style?: Object,
  className?: string,
  targetNode: HTMLElement | null,
};

let TooltipPositioner = (props: PositionerProps) => {
  return createPortal(
    <Popper
      referenceElement={props.targetNode}
      placement={props.placement}
      modifiers={{ hide: { enabled: false }, preventOverflow: { enabled: false } }}
    >
      {({ ref, style }) => (
        <div ref={ref} css={{ zIndex: 2000 }} style={{ ...props.style, ...style }}>
          <div css={{ margin: gridSize }}>
            <TooltipElement className={props.className}>{props.children}</TooltipElement>
          </div>
        </div>
      )}
    </Popper>,
    (document.body: any)
  );
};

// ==============================
// Stateful Component
// ==============================

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
  children: (Ref<*>) => Node,
  content: Node,
  delay: number,
  hideOnMouseDown?: boolean,
  hideOnKeyDown?: boolean,
  onHide?: () => void,
  onShow?: () => void,
  placement: PlacementType,
  className?: string,
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
  ref = createRef<HTMLElement>();
  cancelPendingSetState = NOOP;
  static defaultProps = {
    delay: 300,
    placement: 'bottom',
  };
  componentDidMount() {
    const target = this.ref.current;

    if (!target) {
      throw new Error('You must pass the ref onto your target node.');
    }
    if (!target.nodeName) {
      throw new Error(
        "It looks like you've passed the ref onto a component. You must pass the ref onto your target node."
      );
    }

    target.addEventListener('mouseenter', this.handleMouseEnter, LISTENER_OPTIONS);
    target.addEventListener('mouseleave', this.handleMouseLeave, LISTENER_OPTIONS);
  }
  componentWillUnmount() {
    this.cancelPendingSetState();

    const target = this.ref.current;

    if (target) {
      target.removeEventListener('mouseenter', this.handleMouseEnter, LISTENER_OPTIONS);
      target.removeEventListener('mouseleave', this.handleMouseLeave, LISTENER_OPTIONS);
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
    const { children, content, onHide, onShow, placement, className } = this.props;
    const { isVisible } = this.state;
    const ref = this.ref;

    return (
      <Fragment>
        {children(ref)}

        <TransitionProvider isOpen={isVisible} onEntered={onShow} onExited={onHide}>
          {transitionState => (
            <TooltipPositioner
              targetNode={this.ref.current}
              placement={placement}
              className={className}
              style={fade(transitionState)}
            >
              {content}
            </TooltipPositioner>
          )}
        </TransitionProvider>
      </Fragment>
    );
  }
}
