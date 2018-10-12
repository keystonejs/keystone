// @flow

import React, { Component, type Ref } from 'react';
import RelationshipSelect from './RelationshipSelect';

type Props = {
  field: Object,
  filter: Object,
  innerRef: Ref<*>,
  onChange: Event => void,
};
const EventCatcher = props => (
  <div
    onClick={e => {
      e.preventDefault();
      e.stopPropagation();
    }}
    {...props}
  />
);

export default class RelationshipFilterView extends Component<Props> {
  componentDidUpdate(prevProps) {
    const { filter } = this.props;
    if (prevProps.filter !== filter) {
      this.props.recalcHeight();
    }
  }
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
          item={null}
          itemErrors={{}}
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
