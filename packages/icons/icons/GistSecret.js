
import React, { Component } from 'react';

class GistSecretIcon extends Component {
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
        <path fillRule="evenodd" d="M7.782 10.5l1 3.5h-4l1-3.5-.75-1.5h3.5l-.75 1.5zm2-4.5h-6l-2 1h10l-2-1zm-1-4l-2 1-2-1-1 3h6l-1-3zm4.03 7.75L9.782 9l1 2-2 3h3.22c.45 0 .86-.31.97-.75l.56-2.28c.14-.53-.19-1.08-.72-1.22zM3.782 9l-3.03.75c-.53.14-.86.69-.72 1.22l.56 2.28c.11.44.52.75.97.75h3.22l-2-3 1-2z"/>
      </svg>
    );
  }
}
export default GistSecretIcon;
