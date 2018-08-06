
import React, { Component } from 'react';

class PulseIcon extends Component {
  render() {
    var defaults = {
      'aria-hidden': true,
      height: 16,
      width: 14,
      viewBox: '0 0 14 16',
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
        <path fillRule="evenodd" d="M11.5 8.4L8.8 5.8 6.6 8.9 5.5 2 2.38 8.4H0v2h3.6l.9-1.8.9 5.4L9 8.9l1.6 1.5H14v-2h-2.5z"/>
      </svg>
    );
  }
}
export default PulseIcon;
