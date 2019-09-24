// @flow

import React, { Component } from 'react';
import type { CellProps } from '../../../types';

type Props = CellProps<boolean>;

export default class CheckboxCellView extends Component<Props> {
  roundToDecimalPlace = (value, decimalPlace) =>
    Math.round(value * 10 ** decimalPlace) / 10 ** decimalPlace;
  render() {
    const { data } = this.props;
    if (!data || !data.lat || !data.lng) {
      return null;
    }
    const locations = [
      `Lng: ${this.roundToDecimalPlace(data.lng, 5)}`,
      `Lat: ${this.roundToDecimalPlace(data.lat, 5)}`,
    ];
    return <span>{locations.join(', ')}</span>;
  }
}
