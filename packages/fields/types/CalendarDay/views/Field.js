/** @jsx jsx */
import { jsx } from '@emotion/core';
import { parse, format } from 'date-fns';
import { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@voussoir/ui/src/primitives/fields';
import { Button } from '@voussoir/ui/src/primitives/buttons';
import { DayPicker } from '@voussoir/ui/src/primitives/forms';
import { Popout } from '@voussoir/ui/src/primitives/modals';
import { gridSize } from '@voussoir/ui/src/theme';

const FORMAT = 'YYYY-MM-DD';
const TODAY = new Date();

export default class CalendarDayField extends Component {
  handleSelectedChange = date => {
    const { field, onChange } = this.props;
    const value = format(date, FORMAT);
    onChange(field, value);
  };

  render() {
    const { autoFocus, field, item } = this.props;
    const value = item[field.path];
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
                onSelectedChange={this.handleSelectedChange}
              />
            </div>
          </Popout>
        </FieldInput>
      </FieldContainer>
    );
  }
}
