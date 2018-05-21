// @flow

import React, {
  cloneElement,
  Component,
  Fragment,
  type ComponentType,
  type Element,
} from 'react';
import NodeResolver from 'react-node-resolver';
import { TransitionProvider } from './transitions';

export type CloseType = ({ returnFocus: boolean }) => void;
type Props = {
  target: Element<*>,
  defaultIsOpen: boolean,
};
type State = { isOpen: boolean };

function focus(el) {
  if (el && typeof el.focus === 'function') {
    el.focus();
  }
}

function getDisplayName(C) {
  return `withModalHandlers(${C.displayName || C.name})`;
}

export default function withModalHandlers(
  WrappedComponent: ComponentType<*>,
  { Transition }: { Transition: (*) => * }
) {
  class IntermediateComponent extends Component<Props, State> {
    lastHover: HTMLElement;
    contentNode: HTMLElement;
    targetNode: HTMLElement;
    state = { isOpen: this.props.defaultIsOpen };

    componentDidMount() {
      document.addEventListener('click', this.handleClick);
    }
    componentWillUnmount() {
      document.removeEventListener('click', this.handleClick);
    }

    open = () => {
      this.setState({ isOpen: true });
      document.addEventListener('keydown', this.handleKeyDown, false);
    };
    close = () => {
      this.setState({ isOpen: false });
      document.removeEventListener('keydown', this.handleKeyDown, false);
    };

    handleClick = ({ target }: MouseEvent) => {
      const { isOpen } = this.state;

      // appease flow
      if (!(target instanceof HTMLElement)) return;

      // NOTE: Why not use the <Blanket /> component to close?
      // We don't want to interupt the user's flow. Taking this approach allows
      // user to click "through" to other elements and close the popout.
      if (isOpen && !this.contentNode.contains(target)) {
        this.close();
      }

      // open on target click
      if (!isOpen && this.targetNode.contains(target)) {
        this.open();
      }
    };
    handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;

      if (key === 'Escape') {
        this.close();
      }
    };

    getTarget = (ref: HTMLElement) => {
      this.targetNode = ref;
    };
    getContent = (ref: HTMLElement) => {
      this.contentNode = ref;
    };

    render() {
      const { target } = this.props;
      const { isOpen } = this.state;
      const cloneProps = isOpen ? { isActive: true } : {};

      return (
        <Fragment>
          <NodeResolver innerRef={this.getTarget}>
            {cloneElement(target, cloneProps)}
          </NodeResolver>

          <TransitionProvider isOpen={isOpen}>
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
