
import React, { Component } from 'react';

class TriangleLeftIcon extends Component {
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
        <path fillRule="evenodd" d="M6 2L0 8l6 6V2z"/>
      </svg>
    );
  }
}
export default TriangleLeftIcon;
