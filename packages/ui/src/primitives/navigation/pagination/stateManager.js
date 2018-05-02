// @flow

import React, { Component, type ComponentType } from 'react';
import type { CountArgs, OnChangeType } from './types';

export type Props = {
  defaultValue: number,
  onChange: OnChangeType,
  value?: number,
};
type State = {
  value: number,
};
function ariaPageLabelFn(page: number) {
  return `Go to page ${page}`;
}
function countFormatterFn({
  end,
  pageSize,
  plural,
  singular,
  start,
  total,
}: CountArgs) {
  let count = '';

  if (!total) {
    count = 'No ' + (plural || 'records');
  } else if (total > pageSize) {
    count = `Showing ${start} to ${end} of ${total}`;
  } else {
    count = 'Showing ' + total;
    if (total > 1 && plural) {
      count += ' ' + plural;
    } else if (total === 1 && singular) {
      count += ' ' + singular;
    }
  }

  return count;
}

export default function manageState(PaginationComponent: ComponentType<*>) {
  return class StateManager extends Component<Props, State> {
    static defaultProps = {
      ariaPageLabel: ariaPageLabelFn,
      countFormatter: countFormatterFn,
      defaultValue: 1,
      pageSize: 25,
      limit: 5,
      plural: 'Items',
      singular: 'Item',
    };
    state = {
      value:
        this.props.value !== undefined
          ? this.props.value
          : this.props.defaultValue,
    };
    getValue() {
      return this.props.value !== undefined
        ? this.props.value
        : this.state.value;
    }
    onChange = (value: number) => {
      const { onChange } = this.props;
      if (onChange) onChange(value);
      this.setState({ value });
    };
    render() {
      return (
        <PaginationComponent
          {...this.props}
          onChange={this.onChange}
          value={this.getValue()}
        />
      );
    }
  };
}
