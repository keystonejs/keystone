/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useState } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { colors, fontFamily } from '@arch-ui/theme';

import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

import { format as formatDate, setYear, startOfYear, endOfYear } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';

const keystoneMaterialTheme = createMuiTheme({
  palette: {
    primary: {
      main: colors.primary,
    },
  },
  typography: {
    fontFamily: fontFamily,
  },
});

const MuiDatePicker = ({ value, onChange, onAccept, format, yearRangeFrom, yearRangeTo }) => {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <ThemeProvider theme={keystoneMaterialTheme}>
        <KeyboardDatePicker
          value={value}
          onChange={date => onChange(date)}
          onAccept={onAccept}
          format={format}
          minDate={startOfYear(setYear(new Date(), yearRangeFrom))}
          maxDate={endOfYear(setYear(new Date(), yearRangeTo))}
          variant="dialog"
          inputVariant="outlined"
          margin="dense"
          placeholder="Select a date..."
          showTodayButton
          clearable
        />
      </ThemeProvider>
    </MuiPickersUtilsProvider>
  );
};

const CalendarDayField = ({ field, errors, value: initialValue, onChange }) => {
  const htmlID = `ks-input-${field.path}`;

  // We use null instead of undefined so the date picker doesn't keep defaulting to the current date.
  const [selectedDate, handleDateChange] = useState(
    initialValue === undefined ? null : initialValue
  );

  const handleDateAccept = newDate => {
    try {
      onChange(formatDate(newDate, 'yyyy-MM-dd'));
    } catch (err) {
      onChange(null);
    }
  };

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <FieldInput>
        <MuiDatePicker
          onChange={handleDateChange}
          onAccept={handleDateAccept}
          value={selectedDate}
          {...field.config}
        />
      </FieldInput>
    </FieldContainer>
  );
};

export default CalendarDayField;
