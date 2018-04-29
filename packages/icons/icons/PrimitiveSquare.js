
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class PrimitiveSquareIcon extends Component {
  render() {
    var defaults = {
      'aria-hidden': true,
      height: 16,
      width: 8,
      viewBox: '0 0 8 16',
      style: {
        display: 'inline-block',
        verticalAlign: 'text-top',
        fill: 'currentColor',
      },
    };
    return (
      <svg {...defaults} {...this.props}>
        <path fillRule="evenodd" d="M8 12H0V4h8v8z"/>
      </svg>
    );
  }
}
export default PrimitiveSquareIcon;
