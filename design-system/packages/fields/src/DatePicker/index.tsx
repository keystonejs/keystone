/** @jsx jsx */

import React, { Fragment, useCallback } from 'react';
import FocusLock from 'react-focus-lock';
import { jsx } from '@keystone-ui/core';
import { PopoverDialog, usePopover } from '@keystone-ui/popover';

import { Calendar } from './Calendar';
import { InputButton } from './components/InputButton';
import { formatDMY, formatDateType } from '../utils/dateFormatters';
import { DateType } from '../types';

export type DateInputValue = string | undefined;

export type DatePickerProps = {
  onUpdate: (value: DateType) => void;
  onClear: () => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  value: DateType;
};

export const DatePicker = ({ value, onUpdate, onClear, onBlur, ...props }: DatePickerProps) => {
  const { isOpen, setOpen, dialog, trigger, arrow } = usePopover({
    placement: 'bottom-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 8],
        },
      },
    ],
  });

  const handleDayClick = useCallback(
    (day: Date) => {
      onUpdate(formatDateType(day));
      // wait a moment so the user has time to see the day become selected
      setTimeout(() => {
        setOpen(false);
      }, 300);
    },
    [onUpdate, setOpen]
  );

  const selectedDay = new Date(value as string);
  const formattedDate: DateInputValue = value ? formatDMY(new Date(value)) : undefined;

  return (
    <Fragment>
      <InputButton
        aria-label={'Choose date' + (formattedDate ? `, selected date is ${formattedDate}` : '')}
        onClick={() => setOpen(true)}
        onClear={value ? onClear : undefined}
        isSelected={isOpen}
        ref={trigger.ref}
        {...props}
        {...trigger.props}
        // todo - magic number - align instead to parent Field ?
        style={{ minWidth: 200 }}
      >
        {formattedDate || 'dd/mm/yyyy'}
      </InputButton>
      <PopoverDialog arrow={arrow} isVisible={isOpen} ref={dialog.ref} {...dialog.props}>
        <FocusLock autoFocus returnFocus disabled={!isOpen}>
          <Calendar onDayClick={handleDayClick} selectedDays={selectedDay} />
        </FocusLock>
      </PopoverDialog>
    </Fragment>
  );
};
