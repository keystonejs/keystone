// @flow

import React, { Component } from 'react';
import { RadioGroup, Radio } from '@arch-ui/filters';
import type { FilterProps } from '../../../types';

type Props = FilterProps<boolean>;

export default class PasswordFilterView extends Component<Props> {
  handleChange = (value: 'is_set' | 'is_not_set') => {
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
