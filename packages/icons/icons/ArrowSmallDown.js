
import React, { Component } from 'react';

class ArrowSmallDownIcon extends Component {
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
    const { title, ...props } = this.props;
    return (
      <svg {...defaults} {...props}>
        {title ? <title>{title}</title> : null}
        <path fillRule="evenodd" d="M4 7V5H2v2H0l3 4 3-4H4z"/>
      </svg>
    );
  }
}
export default ArrowSmallDownIcon;
