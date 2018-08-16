// @flow

import React, { Component, type Ref } from 'react';
import { DateTime } from 'luxon';
import format from 'date-fns/format';
import { DateTimePicker } from '@keystonejs/ui/src/primitives/forms';

type Props = {
  field: Object,
  filter: Object,
  innerRef: Ref<*>,
  onChange: Event => void,
};

export default class CalendarDayFilterView extends Component<Props> {
  constructor(props) {
    super(props);
    const value = DateTime.fromJSDate(new Date());
    const dt = DateTime.fromISO(value, { setZone: true });
    this.state = {
      date: value && dt.toFormat('yyyy-LL-dd'),
      time: value && dt.toFormat('HH:mm:ss.SSS'),
      offset: value && dt.toFormat('ZZ'),
    };
  }

  handleDayChange = day => {
    const { onChange } = this.props;
    const newState = { ...this.state, date: format(day, 'YYYY-MM-DD') };
    onChange(`${newState.date}T${newState.time}${newState.offset}`);
    this.setState(newState);
  };

  handleTimeChange = event => {
    const { onChange } = this.props;
    const newState = { ...this.state, time: event.target.value };
    onChange(`${newState.date}T${newState.time}${newState.offset}`);
    this.setState(newState);
  };

  handleOffsetChange = event => {
    const { onChange } = this.props;
    const newState = { ...this.state, offset: event.value };
    onChange(`${newState.date}T${newState.time}${newState.offset}`);
    this.setState(newState);
  };

  componentDidUpdate(prevProps) {
    const { filter } = this.props;

    if (prevProps.filter !== filter) {
      this.props.recalcHeight();
    }
  }

  render() {
    const { filter } = this.props;

    if (!filter) return null;

    const { date, time, offset } = this.state;
    const { handleDayChange, handleTimeChange, handleOffsetChange } = this;
    return (
      <DateTimePicker
        {...this.props}
        {...{ date, time, offset, handleDayChange, handleTimeChange, handleOffsetChange }}
      />
    );
  }
}
