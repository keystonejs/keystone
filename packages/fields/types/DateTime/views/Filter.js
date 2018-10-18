// @flow

import React, { Component } from 'react';
import { DateTime } from 'luxon';
import { format, setMonth, setYear } from 'date-fns';
import { DateTimePicker } from '@voussoir/ui/src/primitives/forms';
import type { FilterProps } from '../../../types';

type Props = FilterProps<string>;

type State = {
  date: string,
  time: string,
  offset: string,
};

type SetDate = Date => void;

export default class CalendarDayFilterView extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const value = DateTime.fromJSDate(new Date());
    const dt = DateTime.fromISO(value, { setZone: true });
    this.state = {
      date: value && dt.toFormat('yyyy-LL-dd'),
      time: value && dt.toFormat('HH:mm:ss.SSS'),
      offset: value && dt.toFormat('ZZ'),
    };
  }

  handleDayChange = (day: Date) => {
    const { onChange } = this.props;
    const newState = { ...this.state, date: format(day, 'YYYY-MM-DD') };
    onChange(`${newState.date}T${newState.time}${newState.offset}`);
    this.setState(newState);
  };

  handleTimeChange = (event: Object) => {
    const { onChange } = this.props;
    const newState = { ...this.state, time: event.target.value };
    onChange(`${newState.date}T${newState.time}${newState.offset}`);
    this.setState(newState);
  };

  handleOffsetChange = (event: Object) => {
    const { onChange } = this.props;
    const newState = { ...this.state, offset: event.value };
    onChange(`${newState.date}T${newState.time}${newState.offset}`);
    this.setState(newState);
  };

  handleMonthSelect = (event: Object, setDate: SetDate, setSelectedDate: SetDate) => {
    const { field, onChange } = this.props;
    const month = event.target.value;
    const newDate = setMonth(this.state.date, month);
    const value = format(newDate, 'YYYY-MM-DD');
    setDate(newDate);
    setSelectedDate(newDate);
    this.setState({ date: value });
    onChange(field);
  };

  handleYearSelect = (event: Object, setDate: SetDate, setSelectedDate: SetDate) => {
    const { field, onChange } = this.props;
    const year = event.target.value;
    const newDate = setYear(this.state.date, year);
    const value = format(newDate, 'YYYY-MM-DD');
    setDate(newDate);
    setSelectedDate(newDate);
    this.setState({ date: value });
    onChange(field);
  };

  componentDidUpdate(prevProps: Props) {
    const { filter } = this.props;

    if (prevProps.filter !== filter) {
      this.props.recalcHeight();
    }
  }

  render() {
    const { filter } = this.props;

    if (!filter) return null;

    const { date, time, offset } = this.state;
    const {
      handleDayChange,
      handleTimeChange,
      handleOffsetChange,
      handleMonthSelect,
      handleYearSelect,
    } = this;
    return (
      <DateTimePicker
        htmlID="calendar-day-filter"
        {...this.props}
        {...{
          date,
          time,
          offset,
          handleDayChange,
          handleTimeChange,
          handleOffsetChange,
          handleMonthSelect,
          handleYearSelect,
        }}
      />
    );
  }
}
