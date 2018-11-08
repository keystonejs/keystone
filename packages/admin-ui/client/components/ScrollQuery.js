import { createRef, Component } from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';

export default class ContainerQuery extends Component {
  scrollElement = createRef();
  state = { hasScroll: false, isScrollable: false, scrollTop: 0 };
  static propTypes = {
    children: PropTypes.func,
  };

  componentDidMount() {
    const measure = this.scrollElement.current;

    this.resizeObserver = new ResizeObserver(([entry]) => {
      this.setScroll(entry.target);
    });
    this.resizeObserver.observe(measure);

    this.setScroll(measure);
  }
  componentWillUnmount() {
    if (this.resizeObserver && this.scrollElement.current) {
      this.resizeObserver.disconnect(this.scrollElement.current);
    }
    this.resizeObserver = null;
  }

  setScroll = target => {
    const isScrollable = target.scrollHeight > target.clientHeight;
    const scrollTop = target.scrollTop;
    const hasScroll = !!scrollTop;

    this.setState({ isScrollable, scrollTop, hasScroll });
  };

  render() {
    const { children, render } = this.props;
    const ref = this.scrollElement;
    const snapshot = this.state;

    return render ? render(ref, snapshot) : children(ref, snapshot);
  }
}
