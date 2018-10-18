// @flow

import React, { Component } from 'react';
import RelationshipSelect from './RelationshipSelect';
import type { FilterProps } from '../../../types';

type Props = FilterProps<null | string>;

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
  componentDidUpdate(prevProps: Props) {
    const { filter } = this.props;
    if (prevProps.filter !== filter) {
      this.props.recalcHeight();
    }
  }
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
