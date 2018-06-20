// @flow

import React, { Component } from 'react';
import { Input } from '@keystonejs/ui/src/primitives/forms';

type Props = { field: Object, filter: Object, onChange: Event => void };
type State = { inputValue: string };

export default class TextFilterView extends Component<Props, State> {
  componentDidUpdate(prevProps) {
    const { filter } = this.props;

    if (prevProps.filter !== filter) {
      this.props.recalcHeight();
    }
  }

  render() {
    const { filter, field, innerRef, onChange, value } = this.props;

    if (!filter) return null;

    const placeholder = field.getFilterLabel(filter);

    return (
      <Input
        onChange={onChange}
        innerRef={innerRef}
        placeholder={placeholder}
        value={value}
      />
    );
  }
}
