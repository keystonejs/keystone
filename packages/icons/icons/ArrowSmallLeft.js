
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ArrowSmallLeftIcon extends Component {
  render() {
    var defaults = {
      'aria-hidden': true,
      height: 16,
      width: 6,
      viewBox: '0 0 6 16',
      style: {
        display: 'inline-block',
        verticalAlign: 'text-top',
        fill: 'currentColor',
      },
    };
    return (
      <svg {...defaults} {...this.props}>
        <path fillRule="evenodd" d="M4 7V5L0 8l4 3V9h2V7H4z"/>
      </svg>
    );
  }
}
export default ArrowSmallLeftIcon;
