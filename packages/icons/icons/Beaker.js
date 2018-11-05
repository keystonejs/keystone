
import React, { Component } from 'react';

class BeakerIcon extends Component {
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
        <path fillRule="evenodd" d="M14.84 14.59L11.46 7V3h1V2h-9v1h1v4l-3.37 7.59A1 1 0 0 0 2 16h11.94c.72 0 1.2-.75.91-1.41h-.01zM4.21 10l1.25-3V3h5v4l1.25 3h-7.5zm4.25-2h1v1h-1V8zm-1-1h-1V6h1v1zm0-3h1v1h-1V4zm0-3h-1V0h1v1z"/>
      </svg>
    );
  }
}
export default BeakerIcon;
