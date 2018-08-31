import { parse, format, setYear } from 'date-fns';
import React, { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@keystonejs/ui/src/primitives/fields';
import { Button } from '@keystonejs/ui/src/primitives/buttons';
import { DayPicker } from '@keystonejs/ui/src/primitives/forms';
import { Popout } from '@keystonejs/ui/src/primitives/modals';
import { gridSize } from '@keystonejs/ui/src/theme';

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

  handleYearSelect = (event, setDate, setSelectedDate) => {
    const { field, onChange } = this.props;
    const year = event.target.value;
    // let value = this.state.value;
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
        {value ? format(value, 'Do MMM YYYY') : FORMAT}
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
              />
            </div>
          </Popout>
        </FieldInput>
      </FieldContainer>
    );
  }
}
