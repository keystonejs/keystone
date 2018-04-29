
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ArrowDownIcon extends Component {
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
        <path fillRule="evenodd" d="M7 7V3H3v4H0l5 6 5-6H7z"/>
      </svg>
    );
  }
}
export default ArrowDownIcon;
