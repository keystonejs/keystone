
import React, { Component } from 'react';

class ArrowSmallLeftIcon extends Component {
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
        <path fillRule="evenodd" d="M4 7V5L0 8l4 3V9h2V7H4z"/>
      </svg>
    );
  }
}
export default ArrowSmallLeftIcon;
