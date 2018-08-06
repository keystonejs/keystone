
import React, { Component } from 'react';

class MuteIcon extends Component {
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
        <path fillRule="evenodd" d="M8 2.75v10.38c0 .67-.81 1-1.28.53L3 9.94H1c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1h2l3.72-3.72C7.19 1.75 8 2.08 8 2.75zm7.53 3.22l-1.06-1.06-1.97 1.97-1.97-1.97-1.06 1.06 1.97 1.97-1.97 1.97 1.06 1.06L12.5 9l1.97 1.97 1.06-1.06-1.97-1.97 1.97-1.97z"/>
      </svg>
    );
  }
}
export default MuteIcon;
