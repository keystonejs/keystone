// @flow
import React, { Component, type Node } from 'react';
import type { FilterProps } from '@voussoir/admin-view/types';

import { RelationshipSelect } from './Select';

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

export class RelationshipFilter extends Component<Props> {
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
          value={null}
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
