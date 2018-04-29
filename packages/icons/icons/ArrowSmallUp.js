
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ArrowSmallUpIcon extends Component {
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
        <path fillRule="evenodd" d="M3 5L0 9h2v2h2V9h2L3 5z"/>
      </svg>
    );
  }
}
export default ArrowSmallUpIcon;
