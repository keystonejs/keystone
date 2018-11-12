// @flow

import React, { cloneElement, Component, Fragment, type ComponentType, type Element } from 'react';
import NodeResolver from 'react-node-resolver';
import { TransitionProvider } from './transitions';

type GenericFn = any => mixed;
export type CloseType = (event: Event) => void;
export type ModalHandlerProps = {
  close: CloseType,
  defaultIsOpen: boolean,
  onClose: GenericFn,
  onOpen: GenericFn,
  target: Element<*>,
};
type State = { isOpen: boolean };

function getDisplayName(C) {
  return `withModalHandlers(${C.displayName || C.name})`;
}
const NOOP = () => {};

export default function withModalHandlers(
  WrappedComponent: ComponentType<*>,
  { Transition }: { Transition: (*) => * }
) {
  class IntermediateComponent extends Component<*, State> {
    lastHover: HTMLElement;
    contentNode: HTMLElement;
    targetNode: HTMLElement;
    state = { isOpen: this.props.defaultIsOpen };
    static defaultProps = {
      onClose: NOOP,
      onOpen: NOOP,
    };

    componentDidMount() {
      document.addEventListener('click', this.handleClick);
    }
    componentWillUnmount() {
      document.removeEventListener('click', this.handleClick);
    }

    open = (event: Event) => {
      if (event && event.defaultPrevented) return;
      this.setState({ isOpen: true });
      document.addEventListener('keydown', this.handleKeyDown, false);
    };
    close = (event: Event) => {
      if (event && event.defaultPrevented) return;
      this.setState({ isOpen: false });
      document.removeEventListener('keydown', this.handleKeyDown, false);
    };

    handleClick = (event: MouseEvent) => {
      const { target } = event;
      const { isOpen } = this.state;

      // NOTE: Why not use the <Blanket /> component to close?
      // We don't want to interupt the user's flow. Taking this approach allows
      // user to click "through" to other elements and close the popout.
      if (isOpen && !this.contentNode.contains(target)) {
        this.close(event);
      }

      // open on target click
      if (!isOpen && this.targetNode.contains(target)) {
        this.open(event);
      }
    };
    handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;

      if (key === 'Escape') {
        this.close(event);
      }
    };

    getTarget = (ref: HTMLElement) => {
      this.targetNode = ref;
    };
    getContent = (ref: HTMLElement) => {
      this.contentNode = ref;
    };

    render() {
      const { target, onClose, onOpen } = this.props;
      const { isOpen } = this.state;
      const cloneProps = isOpen ? { isActive: true } : {};

      return (
        <Fragment>
          <NodeResolver innerRef={this.getTarget}>{cloneElement(target, cloneProps)}</NodeResolver>

          <TransitionProvider isOpen={isOpen} onEntered={onOpen} onExited={onClose}>
            {transitionState => (
              <Transition transitionState={transitionState}>
                <WrappedComponent
                  close={this.close}
                  open={this.open}
                  getModalRef={this.getContent}
                  targetNode={this.targetNode}
                  contentNode={this.contentNode}
                  {...this.props}
                  {...this.state}
                />
              </Transition>
            )}
          </TransitionProvider>
        </Fragment>
      );
    }
  }
  IntermediateComponent.displayName = getDisplayName(WrappedComponent);
  return IntermediateComponent;
}
