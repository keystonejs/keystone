// @flow

import React, { Component, type Ref } from 'react';
import { parse, format } from 'date-fns';
import { DayPicker } from '@voussoir/ui/src/primitives/forms';

const FORMAT = 'YYYY-MM-DD';

type Props = {
  field: Object,
  filter: Object,
  innerRef: Ref<*>,
  onChange: Event => void,
};

type State = {
  value: string,
};

export default class CalendarDayFilterView extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { value: format(new Date(), FORMAT) };
  }

  handleSelectedChange = (day: Date) => {
    const { onChange } = this.props;
    const value = format(day, FORMAT);
    onChange(value);
    this.setState({ value });
  };

  render() {
    const { filter, field } = this.props;

    if (!filter) return null;

    return (
      <DayPicker
        startCurrentDateAt={parse(this.state.value)}
        selectedDate={parse(this.state.value)}
        onSelectedChange={this.handleSelectedChange}
        yearRangeFrom={field.config.yearRangeFrom}
        yearRangeTo={field.config.yearRangeTo}
        yearPickerType={field.config.yearPickerType}
      />
    );
  }
}
