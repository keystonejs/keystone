
import React, { Component } from 'react';

class SyncIcon extends Component {
  render() {
    var defaults = {
      'aria-hidden': true,
      height: 16,
      width: 12,
      viewBox: '0 0 12 16',
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
        <path fillRule="evenodd" d="M10.236 7.4a4.15 4.15 0 0 1-1.2 3.6 4.346 4.346 0 0 1-5.41.54l1.17-1.14-4.3-.6.6 4.2 1.31-1.26c2.36 1.74 5.7 1.57 7.84-.54a5.876 5.876 0 0 0 1.74-4.46l-1.75-.34zM2.956 5a4.346 4.346 0 0 1 5.41-.54L7.196 5.6l4.3.6-.6-4.2-1.31 1.26c-2.36-1.74-5.7-1.57-7.85.54-1.24 1.23-1.8 2.85-1.73 4.46l1.75.35A4.17 4.17 0 0 1 2.956 5z"/>
      </svg>
    );
  }
}
export default SyncIcon;
