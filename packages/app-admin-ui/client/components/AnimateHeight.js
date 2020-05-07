/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, useMemo } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

function Memoize({ children, deps }) {
  return useMemo(children, deps);
}

export default class AnimateHeight extends Component {
  state = { height: this.props.initialHeight, isTransitioning: false };
  static defaultProps = {
    autoScroll: false,
    initialHeight: 0,
  };
  hasMounted = false;
  scrollToTop = () => {
    const { autoScroll } = this.props;
    const element = autoScroll instanceof HTMLElement ? autoScroll : this.node;
    if (!element || typeof element.scrollTo !== 'function') {
      return;
    }
    element.scrollTo(0, 0);
  };
  componentDidMount() {
    this.hasMounted = true;
  }
  calculateHeight = () => {
    const { autoScroll, initialHeight, onChange } = this.props;
    const height = this.node ? this.node.offsetHeight : initialHeight;

    if (height !== this.state.height) {
      this.setState({ height });
      if (
        this.state.isTransitioning === false &&
        // we don't want to animate on the first render
        // because the initial height will either be 0
        // or the current height of the element
        // in the 0 case, we don't want to animate because
        // it'd be strange for an element to increase in height
        // immediately after it renders for the first time
        // in the current height case, we don't want to animate
        // because we're already at that height so there's no point
        this.hasMounted
      ) {
        this.setState({ isTransitioning: true });
      }

      if (autoScroll) {
        this.scrollToTop();
      }
      if (onChange) {
        onChange(height);
      }
    }
  };
  observer = new ResizeObserver(this.calculateHeight);
  componentWillUnmount() {
    this.observer.disconnect();
  }
  getNode = ref => {
    if (!ref) return;
    if (this.node !== ref) {
      if (this.node) {
        this.observer.unobserve(this.node);
      }
      this.observer.observe(ref);
    }
    this.node = ref;
    this.calculateHeight();
  };
  render() {
    const { autoScroll, initialHeight, render, ...props } = this.props;
    const { height, isTransitioning } = this.state;
    const overflow = isTransitioning ? 'hidden' : null;

    return (
      <div
        css={{
          height,
          transition: isTransitioning ? 'height 220ms cubic-bezier(0.2, 0, 0, 1)' : 'none',
          overflow,
        }}
        onTransitionEnd={event => {
          if (event.target === this.node) {
            this.setState({ isTransitioning: false });
          }
        }}
        {...props}
      >
        <Memoize
          // this.getNode will never change so i'm not including it in the deps
          // render will probably change a bunch but that's fine, the reason for
          // memoizing this is so that state updates inside of AnimateHeight don't
          // cause a bunch of rerenders of children
          deps={[render]}
        >
          {() => render({ ref: this.getNode })}
        </Memoize>
      </div>
    );
  }
}
