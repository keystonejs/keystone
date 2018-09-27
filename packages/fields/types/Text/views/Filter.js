// @flow

import React, { Component, type Ref } from 'react';
import { Input } from '@voussoir/ui/src/primitives/forms';
import type { FilterProps } from '@voussoir/fields/types';

type Props = {
  field: Object,
  filter: Object,
  innerRef: Ref<*>,
  onChange: Event => void,
};

export default class TextFilterView extends Component<Props> {
  componentDidUpdate(prevProps) {
    const { filter } = this.props;

    if (prevProps.filter !== filter) {
      this.props.recalcHeight();
    }
  }
  handleChange = ({ target: { value } }: SyntheticEvent<HTMLInputElement>) => {
    this.props.onChange(value);
  };

  render() {
    const { filter, field, innerRef, value } = this.props;
    console.log(filter);
    if (!filter) return null;

    const placeholder = field.getFilterLabel(filter);

    return (
      <Input
        onChange={this.handleChange}
        innerRef={innerRef}
        placeholder={placeholder}
        value={value}
      />
    );
  }
}
