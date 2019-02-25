/** @jsx jsx */
import { jsx } from '@emotion/core';
import { parse, format, getYear } from 'date-fns';
import { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { Button } from '@arch-ui/button';
import { DayPicker } from '@arch-ui/day-picker';
import Popout from '@arch-ui/popout';
import { gridSize } from '@arch-ui/theme';

const FORMAT = 'YYYY-MM-DD';
const TODAY = new Date();

export class CalendarDayField extends Component {
  handleSelectedChange = date => {
    const { field, onChange } = this.props;
    const value = format(date, FORMAT);
    if (
      getYear(value).toString().length <= 4 &&
      getYear(value) <= field.config.yearRangeTo &&
      getYear(value) >= field.config.yearRangeFrom
    ) {
      onChange(value);
    }
  };

  render() {
    const { autoFocus, field, value } = this.props;
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
                selectedDate={value ? parse(value) : null}
                onSelectedChange={this.handleSelectedChange}
                yearRangeFrom={field.config.yearRangeFrom}
                yearRangeTo={field.config.yearRangeTo}
                yearPickerType={field.config.yearPickerType}
              />
            </div>
          </Popout>
        </FieldInput>
      </FieldContainer>
    );
  }
}
