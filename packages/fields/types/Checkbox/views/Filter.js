// @flow

import React, { Component, type Ref } from 'react';

type Props = {
  field: Object,
  filter: Object,
  innerRef: Ref<*>,
  onChange: Event => void,
  recalcHeight: () => void,
  value: string,
};

export default class CheckboxFilterView extends Component<Props> {
  componentDidUpdate(prevProps: Props) {
    const { filter } = this.props;

    if (prevProps.filter !== filter) {
      this.props.recalcHeight();
    }
  }
  handleChange = ({ target: { value } }: Object) => {
    this.props.onChange(value);
  };

  render() {
    const { filter, innerRef, value } = this.props;
    if (!filter) return null;

    return (
      <select onChange={this.handleChange} ref={innerRef} value={value}>
        <option value="true">Checked</option>
        <option value="false">Unchecked</option>
        <option value="null">Not set</option>
      </select>
    );
  }
}
