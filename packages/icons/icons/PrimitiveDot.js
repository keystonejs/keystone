
import React, { Component } from 'react';

class PrimitiveDotIcon extends Component {
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
    const { title, ...props } = this.props;
    return (
      <svg {...defaults} {...props}>
        {title ? <title>{title}</title> : null}
        <path fillRule="evenodd" d="M0 8c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z"/>
      </svg>
    );
  }
}
export default PrimitiveDotIcon;
