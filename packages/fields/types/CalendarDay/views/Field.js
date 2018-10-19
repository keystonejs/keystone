import { parse, format, setYear, setMonth, getYear } from 'date-fns';
import React, { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@voussoir/ui/src/primitives/fields';
import { Button } from '@voussoir/ui/src/primitives/buttons';
import { DayPicker } from '@voussoir/ui/src/primitives/forms';
import { Popout } from '@voussoir/ui/src/primitives/modals';
import { gridSize } from '@voussoir/ui/src/theme';

const FORMAT = 'YYYY-MM-DD';
const TODAY = new Date();

export default class CalendarDayField extends Component {
  constructor(props) {
    super(props);
    const { item, field } = props;
    this.state = { value: item[field.path] };
  }

  yearRangeFrom = this.props.field.config.yearRangeFrom;
  yearRangeTo = this.props.field.config.yearRangeTo;
  yearPickerType = this.props.field.config.yearPickerType;

  onSelectedChange = day => {
    const { field, onChange } = this.props;
    const value = format(day, FORMAT);
    if (
      getYear(value).toString().length <= 4 &&
      getYear(value) <= this.yearRangeTo &&
      getYear(value) >= this.yearRangeFrom
    ) {
      onChange(field, value);
      this.setState({ value });
    }
  };

  handleMonthSelect = (event, setDate, setSelectedDate) => {
    const month = event.target.value;
    const newDate = setMonth(this.state.value, month);
    setDate(newDate);
    setSelectedDate(newDate);
  };

  handleYearSelect = (event, setDate, setSelectedDate) => {
    const year = event.target.value;
    const newDate = setYear(this.state.value, year);
    setSelectedDate(newDate);
    setDate(newDate);
  };

  render() {
    const { autoFocus, field } = this.props;
    const { value } = this.state;
    const htmlID = `ks-input-${field.path}`;
    const target = (
      <Button autoFocus={autoFocus} id={htmlID} variant="ghost">
        {value ? format(value, this.props.field.config.format || 'Do MMM YYYY') : 'Set Date'}
      </Button>
    );

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID}>{field.label}</FieldLabel>
        <FieldInput>
          <Popout target={target} width={280}>
            <div css={{ padding: gridSize }} id={`ks-daypicker-${field.path}`}>
              <DayPicker
                autoFocus={autoFocus}
                startCurrentDateAt={value ? parse(value) : TODAY}
                startSelectedDateAt={value ? parse(value) : TODAY}
                onSelectedChange={this.onSelectedChange}
                handleYearSelect={this.handleYearSelect}
                handleMonthSelect={this.handleMonthSelect}
                yearRangeFrom={this.yearRangeFrom}
                yearRangeTo={this.yearRangeTo}
                yearPickerType={this.yearPickerType}
              />
            </div>
          </Popout>
        </FieldInput>
      </FieldContainer>
    );
  }
}
