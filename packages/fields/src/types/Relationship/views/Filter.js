import React, { Component } from 'react';
import RelationshipSelect from './RelationshipSelect';

const EventCatcher = ({ children }) => (
  <div
    onClick={e => {
      e.preventDefault();
      e.stopPropagation();
    }}
  >
    {children}
  </div>
);

export default class RelationshipFilterView extends Component {
  handleChange = option => {
    const { onChange } = this.props;
    if (option === null) {
      onChange(null);
    } else {
      const { value } = option;
      if (value) {
        onChange(value.id);
      }
    }
  };

  render() {
    const { filter, field, value } = this.props;
    if (!filter) return null;

    const htmlID = `ks-input-${field.path}`;
    return (
      <EventCatcher>
        <RelationshipSelect
          field={field}
          renderContext={null}
          htmlID={htmlID}
          onChange={this.handleChange}
          value={value}
          isMulti={false}
        />
      </EventCatcher>
    );
  }
}
