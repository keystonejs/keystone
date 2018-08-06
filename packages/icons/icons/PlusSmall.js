
import React, { Component } from 'react';

class PlusSmallIcon extends Component {
  render() {
    var defaults = {
      'aria-hidden': true,
      height: 16,
      width: 7,
      viewBox: '0 0 7 16',
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
        <path fillRule="evenodd" d="M4 4H3v3H0v1h3v3h1V8h3V7H4V4z"/>
      </svg>
    );
  }
}
export default PlusSmallIcon;
