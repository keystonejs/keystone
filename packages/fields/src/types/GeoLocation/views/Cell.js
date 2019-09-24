// @flow

import React, { Component } from 'react';
import type { CellProps } from '../../../types';

type Props = CellProps<boolean>;

const roundToDecimalPlace = (value, decimalPlace) =>
  Math.round(value * 10 ** decimalPlace) / 10 ** decimalPlace;

export default class CheckboxCellView extends Component<Props> {
  render() {
    const { data } = this.props;
    if (!data || !data.lat || !data.lng) {
      return null;
    }
    return (
      <span>{`Lng: ${roundToDecimalPlace(data.lng, 5)}, Lat: ${roundToDecimalPlace(
        data.lat,
        5
      )}`}</span>
    );
  }
}
