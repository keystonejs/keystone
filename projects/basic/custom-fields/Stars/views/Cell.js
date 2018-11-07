import React, { PureComponent } from 'react';

import Stars from './Stars';

export default class StarsCellView extends PureComponent {
  render() {
    const { field, data } = this.props;
    const { starCount } = field.config;
    return <Stars count={starCount} value={data} />;
  }
}
