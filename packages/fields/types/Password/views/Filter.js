// @flow

import React, { Component } from 'react';
import { RadioGroup, Radio } from '@keystonejs/ui/src/primitives/filters';

type Props = {
  field: Object,
};

export default class PasswordFilterView extends Component<Props> {
  state = {
    isSet: undefined,
  };

  onRadioChange = value => {
    const isSet = value === 'isSet';

    this.setState({ isSet });
  };

  render() {
    return (
      <RadioGroup onChange={this.onRadioChange}>
        <Radio value="isSet">Is Set</Radio>
        <Radio value="isNotSet">Is NOT Set</Radio>
      </RadioGroup>
    );
  }
}
