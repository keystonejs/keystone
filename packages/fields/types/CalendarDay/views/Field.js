import parse from 'date-fns/parse';
import format from 'date-fns/format';
import React, { Component } from 'react';

import {
  FieldContainer,
  FieldLabel,
  FieldInput,
} from '@keystonejs/ui/src/primitives/fields';
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
    this.state = { value: item[field.path] || format(TODAY, FORMAT) };
  }

  handleDayClick = day => {
    const { field, onChange } = this.props;
    const value = format(day, FORMAT);
    onChange(field, value);
    this.setState({ value });
  };

  render() {
    const { autoFocus, field } = this.props;
    const { value } = this.state;
    const htmlID = `ks-input-${field.path}`;
    const target = (
      <Button autoFocus={autoFocus} id={htmlID} variant="ghost">
        {format(value, 'Do MMM YYYY')}
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
                startCurrentDateAt={parse(value)}
                startSelectedDateAt={parse(value)}
                onSelectedChange={this.handleDayClick}
              />
            </div>
          </Popout>
        </FieldInput>
      </FieldContainer>
    );
  }
}
