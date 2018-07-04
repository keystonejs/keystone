// @flow

import React, { Component, type Ref } from 'react';

type Props = {
  field: Object,
  filter: Object,
  innerRef: Ref<*>,
  onChange: Event => void,
};

export default class BooleanFilterView extends Component<Props> {
  componentDidUpdate(prevProps) {
    const { filter } = this.props;

    if (prevProps.filter !== filter) {
      this.props.recalcHeight();
    }
  }
  handleChange = ({ target: { value } }) => {
    this.props.onChange(value);
  };

  render() {
    const { filter, innerRef, value } = this.props;
    if (!filter) return null;

    return (
      <select onChange={this.handleChange} innerRef={innerRef} value={value}>
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    );
  }
}
