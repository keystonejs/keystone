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
  handleChange = event => {
    const value = event.target.value;
    this.props.onChange(value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'));
    // if (/^\$?[0-9][0-9,]*[0-9]\.?[0-9]{0,2}$/.test(value)) {
    //   this.props.onChange(value);
    // }
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
        value={value}
      />
    );
  }
}
