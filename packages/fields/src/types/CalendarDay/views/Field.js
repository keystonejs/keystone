/** @jsx jsx */

import { jsx } from '@emotion/core';
import { getYear } from 'date-fns';
import { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { TextDayPicker } from '@arch-ui/day-picker';

export default class CalendarDayField extends Component {
  handleSelectedChange = value => {
    const {
      field: {
        config: { yearRangeTo, yearRangeFrom },
      },
      onChange,
    } = this.props;
    const inputYear = getYear(value);
    if (
      value === null ||
      (inputYear.toString().length <= 4 && inputYear <= yearRangeTo && inputYear >= yearRangeFrom)
    ) {
      onChange(value);
    }
  };

  render() {
    const { autoFocus, field, value, errors } = this.props;
    const htmlID = `ks-input-${field.path}`;

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
        <FieldInput>
          <TextDayPicker
            id={`ks-daypicker-${field.path}`}
            autoFocus={autoFocus}
            date={value}
            format={field.config.format}
            onChange={this.handleSelectedChange}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
