
import React, { Component } from 'react';

class TriangleDownIcon extends Component {
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
        <path fillRule="evenodd" d="M0 5l6 6 6-6H0z"/>
      </svg>
    );
  }
}
export default TriangleDownIcon;
