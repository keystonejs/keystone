
import React, { Component } from 'react';

class ReplyIcon extends Component {
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
        <path fillRule="evenodd" d="M6.5 3.5c3.92.44 8 3.125 8 10-2.312-5.062-4.75-6-8-6V11L1 5.5 6.5 0v3.5z"/>
      </svg>
    );
  }
}
export default ReplyIcon;
