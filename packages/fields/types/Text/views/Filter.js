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
      this.focusInputRef();
    }
  }
  getInputRef = ref => {
    this.inputRef = ref;

    // resolve parent ref if provided
    const { innerRef } = this.props;
    if (innerRef) innerRef(ref);
  };
  focusInputRef = () => {
    if (!this.inputRef) return;
    this.inputRef.focus();
  };

  render() {
    const { onChange, value, filter, field } = this.props;

    if (!filter) return null;

    const placeholder = this.props.value
      ? field.label
      : field.getFilterLabel({ field, filter }, false);

    return (
      <Input
        onChange={onChange}
        innerRef={this.getInputRef}
        placeholder={placeholder}
        value={value}
      />
    );
  }
}
