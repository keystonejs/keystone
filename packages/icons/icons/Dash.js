
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class DashIcon extends Component {
  render() {
    var defaults = {
      'aria-hidden': true,
      height: 16,
      width: 8,
      viewBox: '0 0 8 16',
      style: {
        display: 'inline-block',
        verticalAlign: 'text-top',
        fill: 'currentColor',
      },
    };
    return (
      <svg {...defaults} {...this.props}>
        <path fillRule="evenodd" d="M0 7v2h8V7H0z"/>
      </svg>
    );
  }
}
export default DashIcon;
