
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class PlusIcon extends Component {
  render() {
    var defaults = {
      'aria-hidden': true,
      height: 16,
      width: 12,
      viewBox: '0 0 12 16',
      style: {
        display: 'inline-block',
        verticalAlign: 'text-top',
        fill: 'currentColor',
      },
    };
    return (
      <svg {...defaults} {...this.props}>
        <path fillRule="evenodd" d="M12 9H7v5H5V9H0V7h5V2h2v5h5v2z"/>
      </svg>
    );
  }
}
export default PlusIcon;
