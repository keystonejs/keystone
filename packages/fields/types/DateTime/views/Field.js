import { format, setMonth, setYear } from 'date-fns';
import { DateTime } from 'luxon';
import React, { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@voussoir/ui/src/primitives/fields';
import { Button } from '@voussoir/ui/src/primitives/buttons';
import { DateTimePicker } from '@voussoir/ui/src/primitives/forms';
import { Popout } from '@voussoir/ui/src/primitives/modals';

export default class CalendarDayField extends Component {
  constructor(props) {
    super(props);
    const { item, field } = props;
    const value = item[field.path];
    const dt = DateTime.fromISO(value, { setZone: true });
    this.state = {
      date: value && dt.toFormat('yyyy-LL-dd'),
      time: value && dt.toFormat('HH:mm:ss.SSS'),
      offset: value && dt.toFormat('ZZ'),
    };
  }

  handleDayChange = day => {
    const { field, onChange } = this.props;
    const newState = { ...this.state, date: format(day, 'YYYY-MM-DD') };
    onChange(field, `${newState.date}T${newState.time}${newState.offset}`);
    this.setState(newState);
  };

  handleTimeChange = event => {
    const { field, onChange } = this.props;
    const newState = { ...this.state, time: event.target.value };
    onChange(field, `${newState.date}T${newState.time}${newState.offset}`);
    this.setState(newState);
  };

  handleOffsetChange = event => {
    const { field, onChange } = this.props;
    const newState = { ...this.state, offset: event.value };
    onChange(field, `${newState.date}T${newState.time}${newState.offset}`);
    this.setState(newState);
  };

  handleMonthSelect = (event, setDate, setSelectedDate) => {
    const { field, onChange } = this.props;
    const month = event.target.value;
    const newDate = setMonth(this.state.date, month);
    const value = format(newDate, 'YYYY-MM-DD');
    setDate(newDate);
    setSelectedDate(newDate);
    this.setState({ date: value });
    onChange(field, value);
  };

  handleYearSelect = (event, setDate, setSelectedDate) => {
    const { field, onChange } = this.props;
    const year = event.target.value;
    const newDate = setYear(this.state.date, year);
    const value = format(newDate, 'YYYY-MM-DD');
    setDate(newDate);
    setSelectedDate(newDate);
    this.setState({ date: value });
    onChange(field, value);
  };

  render() {
    const { autoFocus, field } = this.props;
    const { date, time, offset } = this.state;
    const htmlID = `ks-input-${field.path}`;
    const target = (
      <Button autoFocus={autoFocus} id={htmlID} variant="ghost">
        {date
          ? format(date + ' ' + time + offset, this.props.field.config.format || 'Do MMM YYYY')
          : 'Set Date & Time'}
      </Button>
    );

    const {
      handleDayChange,
      handleTimeChange,
      handleOffsetChange,
      handleMonthSelect,
      handleYearSelect,
    } = this;
    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID}>{field.label}</FieldLabel>
        <FieldInput>
          <Popout target={target} width={280}>
            <DateTimePicker
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
          </Popout>
        </FieldInput>
      </FieldContainer>
    );
  }
}
