
import React, { Component } from 'react';

class ArrowUpIcon extends Component {
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
        <path fillRule="evenodd" d="M5 3L0 9h3v4h4V9h3L5 3z"/>
      </svg>
    );
  }
}
export default ArrowUpIcon;
