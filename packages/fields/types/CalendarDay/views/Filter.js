// @flow

import React, { Component, type Ref } from 'react';
import { parse, format } from 'date-fns';
import { TextDayPicker } from '@arch-ui/day-picker';

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

  handleSelectedChange = (day: Date | null) => {
    const { onChange } = this.props;
    if (day === null) {
      day = new Date();
    }
    const value = format(day, FORMAT);
    onChange(value);
    this.setState({ value });
  };

  render() {
    const { filter } = this.props;

    if (!filter) return null;

    return <TextDayPicker date={parse(this.state.value)} onChange={this.handleSelectedChange} />;
  }
}
