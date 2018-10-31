// @flow
import { Component, type Node } from 'react';
import { withRouter, type Location } from 'react-router-dom';

type Props = { location: Location, children: Node };

class ScrollToTop extends Component<Props> {
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }
  render() {
    return this.props.children;
  }
}

export default withRouter(ScrollToTop);
