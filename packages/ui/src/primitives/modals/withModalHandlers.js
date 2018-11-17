// @flow

import React, { cloneElement, Component, Fragment, type ComponentType, type Element } from 'react';
import NodeResolver from 'react-node-resolver';
import { TransitionProvider } from './transitions';

type GenericFn = any => mixed;
export type CloseType = (event: Event) => void;
export type ModalHandlerProps = {
  close: CloseType,
  defaultIsOpen: boolean,
  mode: 'click' | 'contextmenu',
  onClose: GenericFn,
  onOpen: GenericFn,
  target: Element<*>,
};
type State = { isOpen: boolean };
type Config = { Transition: (*) => * };

function getDisplayName(C) {
  return `withModalHandlers(${C.displayName || C.name})`;
}
const NOOP = () => {};

export default function withModalHandlers(
  WrappedComponent: ComponentType<*>,
  { Transition }: Config
) {
  class IntermediateComponent extends Component<*, State> {
    lastHover: HTMLElement;
    contentNode: HTMLElement;
    targetNode: HTMLElement;
    state = { isOpen: this.props.defaultIsOpen };
    static defaultProps = {
      mode: 'click',
      onClose: NOOP,
      onOpen: NOOP,
    };

    open = (event: Event) => {
      if (event && event.defaultPrevented) return;
      if (this.props.mode === 'contextmenu') event.preventDefault();
      this.setState({ isOpen: true });
      document.addEventListener('mousedown', this.handleMouseDown);
      document.addEventListener('keydown', this.handleKeyDown, false);
    };
    close = (event: Event) => {
      if (event && event.defaultPrevented) return;
      this.setState({ isOpen: false });
      document.removeEventListener('mousedown', this.handleMouseDown);
      document.removeEventListener('keydown', this.handleKeyDown, false);
    };

    handleMouseDown = (event: MouseEvent) => {
      const { target } = event;
      const { isOpen } = this.state;

      // NOTE: Flow doesn't yet have a definition for `SVGElement`
      // $FlowFixMe
      if (!(target instanceof HTMLElement) && !(target instanceof SVGElement)) {
        return;
      }

      // NOTE: Why not use the <Blanket /> component to close?
      // We don't want to interupt the user's flow. Taking this approach allows
      // user to click "through" to other elements and close the popout.
      if (isOpen && !this.contentNode.contains(target)) {
        this.close(event);
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
      const { mode, onClose, onOpen, target } = this.props;
      const { isOpen } = this.state;

      const cloneProps = {};
      if (isOpen) cloneProps.isActive = true;
      if (mode === 'click') cloneProps.onClick = this.open;
      if (mode === 'contextmenu') cloneProps.onContextMenu = this.open;

      // TODO: prefer functional children that pass refs + snapshot to the target node
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
