import React from 'react';
import PropTypes from 'prop-types';
import { copyToClipboard as copy } from '../util';

export default class CopyToClipboard extends React.PureComponent {
  static propTypes = {
    onError: PropTypes.func,
    onSuccess: PropTypes.func,
    text: PropTypes.string.isRequired,
  };

  static defaultProps = {
    as: 'div',
  };

  onClick = event => {
    const { onError, onSuccess, text } = this.props;

    // Attempt copy to clipboard
    copy(text, onSuccess, onError);

    // Maintain consumer on `onClick` if it exists
    if (this.props.onClick) {
      this.props.onClick(event);
    }
  };

  render() {
    const { as: Tag, onError, onSuccess, text, ...props } = this.props;

    return <Tag onClick={this.onClick} {...props} />;
  }
}
