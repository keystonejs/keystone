import { createRef, Component } from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';
import raf from 'raf-schd';

const LISTENER_OPTIONS = { passive: true };

export default class ScrollQuery extends Component {
  scrollElement = createRef();
  state = { hasScroll: false, isScrollable: false, scrollTop: 0 };
  static propTypes = {
    children: PropTypes.func,
    isPassive: PropTypes.bool,
  };
  static defaultProps = {
    isPassive: true,
  };

  componentDidMount() {
    const { isPassive } = this.props;
    const scrollEl = this.scrollElement.current;

    if (!isPassive) {
      scrollEl.addEventListener('scroll', this.handleScroll, LISTENER_OPTIONS);
    }

    this.resizeObserver = new ResizeObserver(([entry]) => {
      this.setScroll(entry.target);
    });
    this.resizeObserver.observe(scrollEl);

    this.setScroll(scrollEl);
  }
  componentWillUnmount() {
    const { isPassive } = this.props;

    if (!isPassive) {
      this.scrollElement.current.removeEventListener('scroll', this.handleScroll, LISTENER_OPTIONS);
    }

    if (this.resizeObserver && this.scrollElement.current) {
      this.resizeObserver.disconnect(this.scrollElement.current);
    }
    this.resizeObserver = null;
  }

  handleScroll = raf(event => {
    this.setScroll(event.target);
  });

  setScroll = target => {
    const { clientHeight, scrollHeight, scrollTop } = target;
    const isScrollable = scrollHeight > clientHeight;
    const isBottom = scrollTop === scrollHeight - clientHeight;
    const isTop = scrollTop === 0;
    const hasScroll = !!scrollTop;
    if (
      // we only need to compare some parts of state
      // because some of the parts are computed from scrollTop
      this.state.isBottom !== isBottom ||
      this.state.isScrollable !== isScrollable ||
      this.state.scrollHeight !== scrollHeight ||
      this.state.scrollTop !== scrollTop
    ) {
      this.setState({ isBottom, isTop, isScrollable, scrollHeight, scrollTop, hasScroll });
    }
  };

  render() {
    const { children, render } = this.props;
    const ref = this.scrollElement;
    const snapshot = this.state;

    return render ? render(ref, snapshot) : children(ref, snapshot);
  }
}
