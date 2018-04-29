
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class TriangleUpIcon extends Component {
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
        <path fillRule="evenodd" d="M12 11L6 5l-6 6h12z"/>
      </svg>
    );
  }
}
export default TriangleUpIcon;
