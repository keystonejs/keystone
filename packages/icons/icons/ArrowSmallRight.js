
import React, { Component } from 'react';

class ArrowSmallRightIcon extends Component {
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
        <path fillRule="evenodd" d="M6 8L2 5v2H0v2h2v2l4-3z"/>
      </svg>
    );
  }
}
export default ArrowSmallRightIcon;
