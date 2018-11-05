
import React, { Component } from 'react';

class BugIcon extends Component {
  render() {
    var defaults = {
      'aria-hidden': true,
      height: 16,
      width: 16,
      viewBox: '0 0 16 16',
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
        <path fillRule="evenodd" d="M11.17 10h3V9h-3V8l3.17-1.03-.34-.94-2.83.97V6c0-.55-.45-1-1-1V4c0-.48-.36-.88-.83-.97L10.37 2h1.8V1h-2.2l-2 2h-.59L5.37 1h-2.2v1h1.8L6 3.03c-.47.09-.83.48-.83.97v1c-.55 0-1 .45-1 1v1l-2.83-.97-.34.94L4.17 8v1h-3v1h3v1L1 12.03l.34.94L4.17 12v1c0 .55.45 1 1 1h1l1-1V6h1v7l1 1h1c.55 0 1-.45 1-1v-1l2.83.97.34-.94L11.17 11v-1zm-2-5h-3V4h3v1z"/>
      </svg>
    );
  }
}
export default BugIcon;
