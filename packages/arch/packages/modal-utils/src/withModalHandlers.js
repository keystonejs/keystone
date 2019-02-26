// @flow

import React, { cloneElement, Component, Fragment, type ComponentType, type Element } from 'react';
import NodeResolver from 'react-node-resolver';
import ScrollLock from 'react-scrolllock';
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
type State = { isOpen: boolean, clientX: number, clientY: number };
type Config = { Transition: (*) => * };

function getDisplayName(C) {
  return `withModalHandlers(${C.displayName || C.name || 'Component'})`;
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
    state = { isOpen: this.props.defaultIsOpen, clientX: 0, clientY: 0 };
    static defaultProps = {
      mode: 'click',
      onClose: NOOP,
      onOpen: NOOP,
    };

    open = (event: MouseEvent) => {
      if (event && event.defaultPrevented) return;
      if (this.props.mode === 'contextmenu') event.preventDefault();

      const { clientX, clientY } = event;

      this.setState({ isOpen: true, clientX, clientY });

      document.addEventListener('mousedown', this.handleMouseDown);
      document.addEventListener('keydown', this.handleKeyDown, false);
    };
    close = (event: Event) => {
      if (event && event.defaultPrevented) return;

      this.setState({ isOpen: false, clientX: 0, clientY: 0 });

      document.removeEventListener('mousedown', this.handleMouseDown);
      document.removeEventListener('keydown', this.handleKeyDown, false);
    };

    toggle = (event: MouseEvent) => {
      if (this.state.isOpen) {
        this.close(event);
      } else {
        this.open(event);
      }
    };

    handleScroll = (event: WheelEvent) => {
      event.preventDefault();
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
      if (isOpen && !this.contentNode.contains(target) && !this.targetNode.contains(target)) {
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
      const { clientX, clientY, isOpen } = this.state;

      const cloneProps = {};
      if (isOpen) cloneProps.isActive = true;
      if (mode === 'click') cloneProps.onClick = this.toggle;
      if (mode === 'contextmenu') cloneProps.onContextMenu = this.open;

      // TODO: prefer functional children that pass refs + snapshot to the target node
      return (
        <Fragment>
          <NodeResolver innerRef={this.getTarget}>{cloneElement(target, cloneProps)}</NodeResolver>
          {isOpen ? <ScrollLock /> : null}
          <TransitionProvider isOpen={isOpen} onEntered={onOpen} onExited={onClose}>
            {transitionState => (
              <Transition transitionState={transitionState}>
                <WrappedComponent
                  close={this.close}
                  open={this.open}
                  getModalRef={this.getContent}
                  targetNode={this.targetNode}
                  contentNode={this.contentNode}
                  isOpen={isOpen}
                  mouseCoords={{ clientX, clientY }}
                  {...this.props}
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
