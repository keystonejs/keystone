
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ArrowLeftIcon extends Component {
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
        <path fillRule="evenodd" d="M6 3L0 8l6 5v-3h4V6H6V3z"/>
      </svg>
    );
  }
}
export default ArrowLeftIcon;
