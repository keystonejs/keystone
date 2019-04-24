// @flow

import React, { Component, type Node } from 'react';
import RelationshipSelect from './RelationshipSelect';
import type { FilterProps } from '../../../types';

type Props = FilterProps<null | string>;

const EventCatcher = ({ children }: { children: Node }) => (
  <div
    onClick={e => {
      e.preventDefault();
      e.stopPropagation();
    }}
  >
    {children}
  </div>
);

export default class RelationshipFilterView extends Component<Props> {
  handleChange = (option: null | { value: { id: string } }) => {
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
