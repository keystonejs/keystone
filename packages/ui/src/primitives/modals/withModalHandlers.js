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
  children: Element<*>,
  defaultIsOpen: boolean,
};
type State = { isOpen: boolean };

function focus(el) {
  if (el && typeof el.focus === 'function') {
    el.focus();
  }
}

export default function withModalHandlers(
  WrappedComponent: ComponentType<*>,
  { Transition }: { Transition: (*) => * }
) {
  return class Dropdown extends Component<Props, State> {
    lastHover: HTMLElement;
    contentNode: HTMLElement;
    targetNode: HTMLElement;
    state = { isOpen: this.props.defaultIsOpen };

    componentDidMount() {
      document.addEventListener('click', this.handleClick);
      document.addEventListener('keydown', this.handleKeyDown, false);
    }
    componentWillUnmount() {
      document.removeEventListener('click', this.handleClick);
      document.removeEventListener('keydown', this.handleKeyDown, false);
    }

    open = () => {
      this.setState({ isOpen: true });
      focus(this.contentNode.firstChild);
    };
    close = ({ returnFocus }: { returnFocus: boolean }) => {
      this.setState({ isOpen: false });
      if (returnFocus) this.targetNode.focus();
    };

    handleClick = ({ target }: MouseEvent) => {
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
      const { key, target } = event;
      const { isOpen } = this.state;

      // bail when closed
      if (!isOpen || !(target instanceof HTMLElement)) return;

      // bail when escape
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
      const { children } = this.props;
      const { isOpen } = this.state;
      const cloneProps = isOpen ? { isActive: true } : {};

      return (
        <Fragment>
          <NodeResolver innerRef={this.getTarget}>
            {cloneElement(children, cloneProps)}
          </NodeResolver>
          <Transition in={isOpen}>
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
        </Fragment>
      );
    }
  };
}
