// @flow

import React, { Component, type Ref } from 'react';
import { format } from 'date-fns';
import { TextDayPicker } from '@arch-ui/day-picker';

const FORMAT = 'YYYY-MM-DD';

type Props = {
  field: Object,
  filter: Object,
  innerRef: Ref<*>,
  onChange: string => void,
};

type State = {
  value: string,
};

export default class CalendarDayFilterView extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { value: format(new Date(), FORMAT) };
  }

  handleSelectedChange = (value: string | null) => {
    const { onChange } = this.props;
    if (value === null) {
      value = format(new Date(), FORMAT);
    }
    onChange(value);
    this.setState({ value });
  };

  render() {
    const { filter } = this.props;

    if (!filter) return null;

    return <TextDayPicker date={this.state.value} onChange={this.handleSelectedChange} />;
  }
}
