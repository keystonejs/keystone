// @flow

import React, { Component, type Ref } from 'react';
import { Input } from '@voussoir/ui/src/primitives/forms';

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

  valueToString = value => {
    // Make the value a string to prevent loss of accuracy and precision.
    if (typeof value === 'string') {
      return value;
    } else if (typeof value === 'number') {
      return String(value);
    } else {
      // If it is neither string nor number then it must be empty.
      return '';
    }
  };

  handleChange = event => {
    const value = event.target.value;
    if (/^-?\d*\.?\d*$/.test(value)) {
      this.props.onChange(value);
    }
    console.log(typeof value, value, 'Filter');
  };

  render() {
    const { filter, field, innerRef, value } = this.props;

    if (!filter) return null;

    const placeholder = field.getFilterLabel(filter);

    return (
      <Input
        onChange={this.handleChange}
        innerRef={innerRef}
        placeholder={placeholder}
        value={this.valueToString(value)}
      />
    );
  }
}
