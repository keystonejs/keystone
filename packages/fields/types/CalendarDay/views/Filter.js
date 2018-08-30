// @flow

import React, { Component, type Ref } from 'react';
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import { DayPicker } from '@keystonejs/ui/src/primitives/forms';

const FORMAT = 'YYYY-MM-DD';

type Props = {
  field: Object,
  filter: Object,
  innerRef: Ref<*>,
  onChange: Event => void,
};

export default class CalendarDayFilterView extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = { value: format(new Date(), FORMAT) };
  }

  handleDayClick = day => {
    const { onChange } = this.props;
    const value = format(day, FORMAT);
    onChange(value);
    this.setState({ value });
  };

  handleYearSelect = year => {
    const { onChange } = this.props;
    const value = format(year, FORMAT);
    onChange(value);
    this.setState({ value });
  }

  componentDidUpdate(prevProps) {
    const { filter } = this.props;

    if (prevProps.filter !== filter) {
      this.props.recalcHeight();
    }
  }

  render() {
    const { filter } = this.props;

    if (!filter) return null;

    return (
      <DayPicker
        startCurrentDateAt={parse(this.state.value)}
        startSelectedDateAt={parse(this.state.value)}
        onSelectedChange={this.handleDayClick}
        handleYearSelect={this.handleYearSelect}
      />
    );
  }
}
