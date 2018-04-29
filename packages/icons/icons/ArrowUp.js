
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ArrowUpIcon extends Component {
  render() {
    var defaults = {
      'aria-hidden': true,
      height: 16,
      width: 10,
      viewBox: '0 0 10 16',
      style: {
        display: 'inline-block',
        verticalAlign: 'text-top',
        fill: 'currentColor',
      },
    };
    return (
      <svg {...defaults} {...this.props}>
        <path fillRule="evenodd" d="M5 3L0 9h3v4h4V9h3L5 3z"/>
      </svg>
    );
  }
}
export default ArrowUpIcon;
