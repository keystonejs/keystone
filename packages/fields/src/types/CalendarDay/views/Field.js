/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { TextDayPicker } from '@arch-ui/day-picker';
import { Alert } from '@arch-ui/alert';

export default class CalendarDayField extends Component {
  render() {
    const { autoFocus, field, value, errors, onChange } = this.props;
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
            onChange={onChange}
          />
        </FieldInput>

        {errors.map(({ message, data }) => (
          <Alert appearance="danger" key={message}>
            {message}
            {data ? ` - ${JSON.stringify(data)}` : null}
          </Alert>
        ))}
      </FieldContainer>
    );
  }
}
