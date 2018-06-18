// @flow

import React, { Component } from 'react';
import { RadioGroup, Radio } from '@keystonejs/ui/src/primitives/filters';

type Props = {
  field: Object,
};

export default class FilterSelect extends Component<Props> {
  state = {
    isSet: undefined,
  };

  onRadioChange = value => {
    const isSet = value === 'isSet';

    this.setState({ isSet }, this.updateQuery);
  };
  updateQuery = () => {
    const { field, onChange } = this.props;
    const { isSet } = this.state;

    const expression = isSet ? 'is set' : 'is NOT set';
    const label = `${field.label} ${expression}`;
    const query = { [field.path]: isSet };

    onChange({ query, label });
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
