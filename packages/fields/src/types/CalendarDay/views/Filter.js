import React, { Component } from 'react';
import { format } from 'date-fns';
import { TextDayPicker } from '@arch-ui/day-picker';

const FORMAT = 'YYYY-MM-DD';

export default class CalendarDayFilterView extends Component {
  constructor(props) {
    super(props);
    this.state = { value: format(new Date(), FORMAT) };
  }

  handleSelectedChange = value => {
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
