
import React, { Component } from 'react';

class DiffRenamedIcon extends Component {
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
        <path fillRule="evenodd" d="M6 9H3V7h3V4l5 4-5 4V9zm8-7v12c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h12c.55 0 1 .45 1 1zm-1 0H1v12h12V2z"/>
      </svg>
    );
  }
}
export default DiffRenamedIcon;
