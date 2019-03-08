import React, { Component } from 'react';
import InvalidRoutePage from '../client/pages/InvalidRoute';

export default class Error extends Component {
  static getInitialProps({ res, err }) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null;
    return { statusCode };
  }

  render() {
    return <InvalidRoutePage statusCode={this.props.statusCode} />;
  }
}
