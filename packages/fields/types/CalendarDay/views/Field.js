/** @jsx jsx */
import { jsx } from '@emotion/core';
import { parse, format, setYear, setMonth } from 'date-fns';
import { Component } from 'react';

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

  handleDayClick = day => {
    const { field, onChange } = this.props;
    const value = format(day, FORMAT);
    onChange(field, value);
    this.setState({ value });
  };

  handleMonthSelect = (event, setDate, setSelectedDate) => {
    const { field, onChange } = this.props;
    const month = event.target.value;
    const newDate = setMonth(this.state.value, month);
    const value = format(newDate, FORMAT);
    setDate(newDate);
    setSelectedDate(newDate);
    this.setState({ value });
    onChange(field, value);
  };

  handleYearSelect = (event, setDate, setSelectedDate) => {
    const { field, onChange } = this.props;
    const year = event.target.value;
    const newDate = setYear(this.state.value, year);
    const value = format(newDate, FORMAT);
    setDate(newDate);
    setSelectedDate(newDate);
    this.setState({ value });
    onChange(field, value);
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
                onSelectedChange={this.handleDayClick}
                handleYearSelect={this.handleYearSelect}
                handleMonthSelect={this.handleMonthSelect}
              />
            </div>
          </Popout>
        </FieldInput>
      </FieldContainer>
    );
  }
}
