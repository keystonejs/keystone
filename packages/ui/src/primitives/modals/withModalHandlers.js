// @flow

import React, {
  cloneElement,
  Component,
  Fragment,
  type ComponentType,
  type Element,
} from 'react';
import NodeResolver from 'react-node-resolver';

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

export default function withModalHandlers(WrappedComponent: ComponentType<*>) {
  class IntermediateComponent extends Component<Props, State> {
    lastHover: HTMLElement;
    contentNode: HTMLElement;
    targetNode: HTMLElement;
    state = { isOpen: this.props.defaultIsOpen };

    componentDidMount() {
      document.addEventListener('click', this.handleTargetClick);
    }
    componentWillUnmount() {
      document.removeEventListener('click', this.handleTargetClick);
    }

    open = () => {
      this.setState({ isOpen: true });

      document.addEventListener('keydown', this.handleKeyDown, false);
    };
    close = ({ returnFocus }: { returnFocus: boolean }) => {
      this.setState({ isOpen: false });
      if (returnFocus) this.targetNode.focus();

      document.removeEventListener('keydown', this.handleKeyDown, false);
    };

    handleTargetClick = ({ target }: MouseEvent) => {
      const { isOpen } = this.state;

      // appease flow
      if (!(target instanceof HTMLElement)) return;

      // close on outside click
      if (isOpen && !this.contentNode.contains(target)) {
        this.close({ returnFocus: false });
      }

      // open on target click
      if (!isOpen && this.targetNode.contains(target)) {
        this.open();
      }
    };
    handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;

      if (key === 'Escape') {
        this.close({ returnFocus: true });
        return;
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
          {isOpen ? (
            <WrappedComponent
              close={this.close}
              open={this.open}
              getModalRef={this.getContent}
              targetNode={this.targetNode}
              contentNode={this.contentNode}
              {...this.props}
            />
          ) : null}
        </Fragment>
      );
    }
  }
  IntermediateComponent.displayName = getDisplayName(WrappedComponent);
  return IntermediateComponent;
}
