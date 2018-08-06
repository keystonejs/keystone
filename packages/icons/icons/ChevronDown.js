
import React, { Component } from 'react';

class ChevronDownIcon extends Component {
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
        <path fillRule="evenodd" d="M5 11.5l-5-5L1.5 5 5 8.75 8.5 5 10 6.5l-5 5z"/>
      </svg>
    );
  }
}
export default ChevronDownIcon;
