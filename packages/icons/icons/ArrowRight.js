
import React, { Component } from 'react';

class ArrowRightIcon extends Component {
  render() {
    var defaults = {
      'aria-hidden': true,
      height: 16,
      width: 10,
      viewBox: '0 0 10 16',
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
        <path fillRule="evenodd" d="M10 8L4 3v3H0v4h4v3l6-5z"/>
      </svg>
    );
  }
}
export default ArrowRightIcon;
