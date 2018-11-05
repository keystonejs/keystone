
import React, { Component } from 'react';

class PinIcon extends Component {
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
        <path fillRule="evenodd" d="M10 1.494v.8l.5 1-4.5 3H2.2c-.44 0-.67.53-.34.86L5 10.294l-4 5 5-4 3.14 3.14a.5.5 0 0 0 .86-.34v-3.8l3-4.5 1 .5h.8c.44 0 .67-.53.34-.86l-4.28-4.28a.5.5 0 0 0-.86.34z"/>
      </svg>
    );
  }
}
export default PinIcon;
