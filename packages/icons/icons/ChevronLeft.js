
import React, { Component } from 'react';

class ChevronLeftIcon extends Component {
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
        <path fillRule="evenodd" d="M6 3l1.5 1.5L3.75 8l3.75 3.5L6 13 1 8l5-5z"/>
      </svg>
    );
  }
}
export default ChevronLeftIcon;
