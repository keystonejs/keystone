
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class PlusSmallIcon extends Component {
  render() {
    var defaults = {
      'aria-hidden': true,
      height: 16,
      width: 7,
      viewBox: '0 0 7 16',
      style: {
        display: 'inline-block',
        verticalAlign: 'text-top',
        fill: 'currentColor',
      },
    };
    return (
      <svg {...defaults} {...this.props}>
        <path fillRule="evenodd" d="M4 4H3v3H0v1h3v3h1V8h3V7H4V4z"/>
      </svg>
    );
  }
}
export default PlusSmallIcon;
