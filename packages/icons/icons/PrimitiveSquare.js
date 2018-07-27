
import React, { Component } from 'react';

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
    const { title, ...props } = this.props;
    return (
      <svg {...defaults} {...props}>
        {title ? <title>{title}</title> : null}
        <path fillRule="evenodd" d="M8 12H0V4h8v8z"/>
      </svg>
    );
  }
}
export default PrimitiveSquareIcon;
