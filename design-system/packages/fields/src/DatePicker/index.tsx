/** @jsxRuntime classic */
/** @jsx jsx */

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import FocusLock from 'react-focus-lock';
import { jsx } from '@keystone-ui/core';
import { PopoverDialog, useControlledPopover } from '@keystone-ui/popover';

import {
  deserializeDate,
  formatDate,
  formatDateType,
  dateFormatPlaceholder,
} from '../utils/dateFormatters';
import { DateType } from '../types';
import { Calendar } from './Calendar';
import { InputButton } from './components/InputButton';

export type DateInputValue = string | undefined;

export type DatePickerProps = {
  onUpdate: (value: DateType) => void;
  onClear: () => void;
  onBlur?: () => void;
  value: DateType;
};

export function useEventCallback<Func extends (...args: any) => any>(callback: Func): Func {
  const callbackRef = useRef(callback);
  const cb = useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
  useEffect(() => {
    callbackRef.current = callback;
  });
  return cb as any;
}

export const DatePicker = ({
  value,
  onUpdate,
  onClear,
  onBlur: _onBlur,
  ...props
}: DatePickerProps) => {
  const [isOpen, _setOpen] = useState(false);
  const onBlur = useEventCallback(() => {
    _onBlur?.();
  });
  const setOpen = useCallback(
    (val: boolean) => {
      _setOpen(val);
      if (!val) {
        onBlur?.();
      }
    },
    [onBlur]
  );
  const { dialog, trigger, arrow } = useControlledPopover(
    {
      isOpen,
      onClose: useCallback(() => {
        setOpen(false);
      }, [setOpen]),
    },
    {
      placement: 'bottom-start',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ],
    }
  );

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

  // We **can** memoize this, but its a trivial operation
  // and in the opinion of the author not really something to do
  // before other more important performance optimisations
  const selectedDay = deserializeDate(value);
  const formattedDate: DateInputValue = value ? formatDate(selectedDay) : undefined;

  return (
    <Fragment>
      <InputButton
        aria-label={'Choose date' + (formattedDate ? `, selected date is ${formattedDate}` : '')}
        onClick={() => setOpen(true)}
        onClear={
          value
            ? () => {
                onClear();
                onBlur?.();
              }
            : undefined
        }
        isSelected={isOpen}
        ref={trigger.ref}
        {...props}
        {...trigger.props}
        // todo - magic number - align instead to parent Field ?
        style={{ minWidth: 200 }}
      >
        {formattedDate || dateFormatPlaceholder}
      </InputButton>
      <PopoverDialog arrow={arrow} isVisible={isOpen} ref={dialog.ref} {...dialog.props}>
        <FocusLock autoFocus returnFocus disabled={!isOpen}>
          <Calendar onDayClick={handleDayClick} selectedDays={selectedDay} />
        </FocusLock>
      </PopoverDialog>
    </Fragment>
  );
};
