/** @jsx jsx */

import { Fragment, useCallback } from 'react';
import FocusLock from 'react-focus-lock';
import formatISO from 'date-fns/formatISO';
import { jsx } from '@keystone-ui/core';
import { PopoverDialog, usePopover } from '@keystone-ui/popover';

import { Calendar } from './Calendar';
import { InputButton } from './components/InputButton';
import { ISODate } from './types';
import { formatDateObj } from './utils/formatDateObj';

export type DatePickerProps = {
  onChange: (value: ISODate | undefined) => void;
  onClear: () => void;
  value: ISODate | undefined;
};

export const DatePicker = ({ value, onChange, onClear, ...props }: DatePickerProps) => {
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
      onChange(formatISO(day, { representation: 'date' }) as ISODate);

      // wait a moment so the user has time to see the day become selected
      setTimeout(() => {
        setOpen(false);
      }, 300);
    },
    [onChange, setOpen]
  );

  const selectedDay = new Date(value as string);
  const formattedDate = value ? formatDateObj(new Date(value)) : undefined;

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
        // todo - style is a magic number
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
