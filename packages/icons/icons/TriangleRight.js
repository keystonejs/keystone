
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class TriangleRightIcon extends Component {
  render() {
    var defaults = {
      'aria-hidden': true,
      height: 16,
      width: 6,
      viewBox: '0 0 6 16',
      style: {
        display: 'inline-block',
        verticalAlign: 'text-top',
        fill: 'currentColor',
      },
    };
    return (
      <svg {...defaults} {...this.props}>
        <path fillRule="evenodd" d="M0 14l6-6-6-6v12z"/>
      </svg>
    );
  }
}
export default TriangleRightIcon;
