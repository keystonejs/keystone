// @flow

import React, { Component, type Ref } from 'react';
import { RadioGroup, Radio } from '@voussoir/ui/src/primitives/filters';

type Props = { field: Object, innerRef: Ref<*>, onChange: Event => void };

export default class PasswordFilterView extends Component<Props> {
  handleChange = value => {
    const boolValue = value === 'is_set' ? true : false;
    this.props.onChange(boolValue);
  };
  render() {
    const { value } = this.props;
    const textValue = value ? 'is_set' : 'is_not_set';

    return (
      <RadioGroup onChange={this.handleChange} value={textValue}>
        <Radio value="is_set">Is Set</Radio>
        <Radio value="is_not_set">Is NOT Set</Radio>
      </RadioGroup>
    );
  }
}
