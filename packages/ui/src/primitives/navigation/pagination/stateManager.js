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
      currentPage: 1,
      pageSize: 25,
      limit: 5,
      plural: 'Items',
      singular: 'Item',
    };
    state = {
      currentPage: this.props.currentPage,
    };
    onChange = (changeData) => {
      const { onChange } = this.props;
      if (onChange) onChange(changeData);
      this.setState({ currentPage: changeData.page });
    };
    render() {
      return (
        <PaginationComponent
          {...this.props}
          onChange={this.onChange}
          currentPage={this.state.currentPage}
        />
      );
    }
  };
}
