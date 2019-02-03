/** @jsx jsx */
import { jsx } from '@emotion/core';
import { parse, format, getYear } from 'date-fns';
import { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { Button } from '@arch-ui/button';
import { TextDayPicker } from '@arch-ui/day-picker';
import Popout from '@arch-ui/popout';
import { gridSize } from '@arch-ui/theme';

const FORMAT = 'YYYY-MM-DD';
const TODAY = new Date();

export default class CalendarDayField extends Component {
  handleSelectedChange = date => {
    const { field, onChange } = this.props;
    const value = date === null ? null : format(date, FORMAT);
    if (
      value === null ||
      (getYear(value).toString().length <= 4 &&
        getYear(value) <= field.config.yearRangeTo &&
        getYear(value) >= field.config.yearRangeFrom)
    ) {
      onChange(field, value);
    }
  };

  render() {
    const { autoFocus, field, item } = this.props;
    const value = item[field.path];
    const htmlID = `ks-input-${field.path}`;

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID}>{field.label}</FieldLabel>
        <FieldInput>
          <TextDayPicker
            id={`ks-daypicker-${field.path}`}
            autoFocus={autoFocus}
            date={value ? parse(value) : null}
            onChange={this.handleSelectedChange}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
