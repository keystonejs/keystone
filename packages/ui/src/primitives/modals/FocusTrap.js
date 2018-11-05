// @flow

import React, { Component, type Element } from 'react';
import createFocusTrap from 'focus-trap';
import NodeResolver from 'react-node-resolver';

export type FocusTarget = HTMLElement | string | Fn;
type Fn = (*) => void;
type Options = {
  /* A function that will be called when the focus trap activates. */
  onActivate?: Fn,
  /* A function that will be called when the focus trap deactivates */
  onDeactivate?: Fn,
  /*
    By default, when a focus trap is activated the first element in the focus
    trap's tab order will receive focus. With this option you can specify a
    different element to receive that initial focus. Can be a DOM node, or a
    selector string (which will be passed to document.querySelector() to find
    the DOM node), or a function that returns a DOM node.
  */
  initialFocus?: FocusTarget,
  /*
    By default, an error will be thrown if the focus trap contains no elements
    in its tab order. With this option you can specify a fallback element to
    programmatically receive focus if no other tabbable elements are found.
    For example, you may want a popover's <div> to receive focus if the
    popover's content includes no tabbable elements. Make sure the fallback
    element has a negative tabindex so it can be programmatically focused. The
    option value can be a DOM node, a selector string (which will be passed to
    document.querySelector() to find the DOM node), or a function that returns
    a DOM node.
  */
  fallbackFocus?: FocusTarget,
  /*
    Default: true. If false, the Escape key will not trigger deactivation of
    the focus trap. This can be useful if you want to force the user to make a
    decision instead of allowing an easy way out.
  */
  escapeDeactivates?: boolean,
  /*
    Default: false. If true, a click outside the focus trap will deactivate the
    focus trap and allow the click event to do its thing.
  */
  clickOutsideDeactivates?: boolean,
  /*
    Default: true. If false, when the trap is deactivated, focus will not
    return to the element that had focus before activation.
  */
  returnFocusOnDeactivate?: boolean,
};
type Props = {
  children: Element<*>,
  isActive?: boolean,
  isPaused?: boolean,
  options: Options,
};

export default class FocusTrap extends Component<Props> {
  boundary: HTMLElement;
  options: Options;
  createFocusTrap = createFocusTrap;
  focusTrap: Object;
  previouslyFocusedElement: HTMLElement;
  static defaultProps = {
    isActive: true,
    isPaused: false,
    options: {},
  };
  componentWillMount() {
    if (document && document.activeElement) {
      this.previouslyFocusedElement = document.activeElement;
    }
  }

  componentDidMount() {
    const { isActive, options, isPaused } = this.props;

    // Objects as defaultProps don't merge, set and spread here instead
    const defaultOptions = {
      escapeDeactivates: true,
      fallbackFocus: this.boundary,
      returnFocusOnDeactivate: true,
    };

    this.options = { ...defaultOptions, ...options };
    this.focusTrap = this.createFocusTrap(this.boundary, this.options);

    if (isActive) this.focusTrap.activate();
    if (isPaused) this.focusTrap.pause();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.isActive && !this.props.isActive) {
      this.focusTrap.deactivate();
    } else if (!prevProps.isActive && this.props.isActive) {
      this.focusTrap.activate();
    }

    if (prevProps.isPaused && !this.props.isPaused) {
      this.focusTrap.unpause();
    } else if (!prevProps.isPaused && this.props.isPaused) {
      this.focusTrap.pause();
    }
  }

  componentWillUnmount() {
    this.focusTrap.deactivate();

    if (
      this.options.returnFocusOnDeactivate &&
      this.previouslyFocusedElement &&
      this.previouslyFocusedElement.focus
    ) {
      this.previouslyFocusedElement.focus();
    }
  }

  getBoundary = (ref: HTMLElement) => {
    this.boundary = ref;
  };

  render() {
    return <NodeResolver innerRef={this.getBoundary}>{this.props.children}</NodeResolver>;
  }
}
