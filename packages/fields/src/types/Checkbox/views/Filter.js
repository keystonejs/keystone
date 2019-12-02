import React, { Component } from 'react';

export default class CheckboxFilterView extends Component {
  handleChange = ({ target: { value } }) => {
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
