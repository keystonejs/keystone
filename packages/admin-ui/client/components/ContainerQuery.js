import React, { createRef, Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';

export default class ContainerQuery extends Component {
  measureElement = createRef();
  state = { width: 'auto' };
  static propTypes = {
    children: PropTypes.func,
  };

  componentDidMount() {
    const measure = this.measureElement.current;

    this.resizeObserver = new ResizeObserver(([entry]) => {
      this.setWidth(entry.target.offsetWidth);
    });
    this.resizeObserver.observe(measure);

    this.setWidth(measure.offsetWidth);
  }
  componentWillUnmount() {
    if (this.resizeObserver && this.measureElement.current) {
      this.resizeObserver.disconnect(this.measureElement.current);
    }
    this.resizeObserver = null;
  }

  setWidth = width => {
    this.setState({ width });
  };

  render() {
    return (
      <Fragment>
        <div ref={this.measureElement} />
        {this.props.children(this.state)}
      </Fragment>
    );
  }
}
