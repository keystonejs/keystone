// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { type Node, type Ref } from 'react';
import styled from '@emotion/styled';
import Kalendaryo from 'kalendaryo';
import {
  isToday as isDayToday,
  isSameMonth,
  parse,
  getYear,
  getMonth,
  setMonth,
  format,
  setDay,
  setYear,
} from 'date-fns';
import { Input } from './index';
import { Select } from '../filters';
import { ChevronLeftIcon, ChevronRightIcon } from '@voussoir/icons';
import { borderRadius, colors } from '../../theme';

const yearRange = (from, to) => {
  const years = [];
  let year = from;
  while (year <= to) {
    years.push(year++);
  }
  return years;
};

const Wrapper = styled.div({
  fontSize: '0.85rem',
});

const Header = styled.div({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
});

const HeaderButton = props => (
  <button
    type="button"
    css={{
      background: 'none',
      borderRadius: borderRadius,
      border: 'none',
      cursor: 'pointer',
      padding: '0.5rem 0.75rem',
      outline: 'none',

      ':hover': {
        backgroundColor: colors.N05,
      },
      ':active': {
        backgroundColor: colors.N10,
      },
    }}
    {...props}
  />
);
const Body = 'div';

const WeekRow = styled.div({
  display: 'flex',
});

const WeekLabels = styled(WeekRow)({
  color: colors.N40,
  fontSize: '0.65rem',
  fontWeight: 500,
  textTransform: 'uppercase',
});

const Day = styled.div(({ disabled, isInteractive, isSelected, isToday }) => {
  let textColor;
  if (isToday) textColor = colors.danger;
  if (disabled) textColor = colors.N40;
  if (isSelected) textColor = 'white';

  return {
    alignItems: 'center',
    backgroundColor: isSelected ? colors.primary : null,
    borderRadius: borderRadius,
    color: textColor,
    cursor: isInteractive ? 'pointer' : 'default',
    display: 'flex',
    flexDirection: 'column',
    fontWeight: isSelected || isToday ? 'bold' : null,
    flexBasis: 'calc(100% / 7)',
    padding: '0.5rem',
    textAlign: 'center',
    width: 'calc(100% / 7)',

    ':hover': {
      backgroundColor: isInteractive && !isSelected ? colors.B.L90 : null,
      color: isInteractive && !isSelected && !isToday ? colors.B.D40 : null,
    },
    ':active': {
      backgroundColor: isInteractive && !isSelected ? colors.B.L80 : null,
    },
  };
});

const TodayMarker = styled.div(({ isSelected }) => ({
  backgroundColor: isSelected ? 'white' : colors.danger,
  borderRadius: 4,
  height: 2,
  marginBottom: -4,
  marginTop: 2,
  width: '1em',
}));

type SelectMonthProps = {
  onChange: string => mixed,
  date: Date,
};

class SelectMonth extends React.Component<SelectMonthProps> {
  render() {
    const { onChange, date } = this.props;
    const months = [...new Array(12)].map((_, month) => format(setMonth(new Date(), month), 'MMM'));

    return (
      <select
        onChange={event => {
          onChange(event.target.value);
        }}
        value={getMonth(date)}
      >
        {months.map((month, i) => (
          <option key={i} value={i}>
            {month}
          </option>
        ))}
      </select>
    );
  }
}

type SelectYearProps = {
  onChange: number => mixed,
  date: Date,
  yearRangeFrom: any,
  yearRangeTo: any,
  yearPickerType: string,
};

class SelectYear extends React.Component<SelectYearProps> {
  render() {
    const {
      onChange,
      date,
      yearRangeFrom = getYear(new Date()) - 100,
      yearRangeTo = getYear(new Date()),
      yearPickerType = 'auto',
    } = this.props;
    const years = yearRange(yearRangeFrom, yearRangeTo);

    if ((years.length > 50 && yearPickerType == 'auto') || yearPickerType == 'input') {
      return (
        <input
          type="number"
          min={yearRangeFrom}
          max={yearRangeTo}
          onChange={event => {
            onChange(event.target.value);
          }}
          value={getYear(date)}
        />
      );
    } else {
      return (
        <select
          onChange={event => {
            onChange(event.target.value);
          }}
          value={getYear(date)}
        >
          {years.map((year, i) => (
            <option key={i} value={year}>
              {year}
            </option>
          ))}
        </select>
      );
    }
  }
}

type DayPickerProps = {
  onSelectedChange: Date => void,
  yearRangeFrom?: number,
  yearRangeTo?: number,
  yearPickerType?: string,
};

export const DayPicker = (props: DayPickerProps) => {
  function BasicCalendar(kalendaryo) {
    const {
      getFormattedDate,
      getWeeksInMonth,
      getDatePrevMonth,
      getDateNextMonth,
      setSelectedDate,
      setDate,
      selectedDate,
      date,
    } = kalendaryo;
    const yearRangeFrom = props.yearRangeFrom ? props.yearRangeFrom : getYear(new Date()) - 100;
    const yearRangeTo = props.yearRangeTo ? props.yearRangeTo : getYear(new Date());
    const yearPickerType = props.yearPickerType ? props.yearPickerType : 'auto';

    const weeksInCurrentMonth = getWeeksInMonth();

    const setDateNextMonth = () => {
      setDate(getDateNextMonth());
    };

    const setDatePrevMonth = () => setDate(getDatePrevMonth());
    const selectDay = _date => () => setSelectedDate(_date);

    const isSelectedDay = _date => getFormattedDate(selectedDate) === getFormattedDate(_date);
    const isDisabled = dateValue => !isSameMonth(date, dateValue);

    return (
      <Wrapper>
        <Header>
          <HeaderButton onClick={setDatePrevMonth}>
            <ChevronLeftIcon />
          </HeaderButton>
          <SelectMonth
            onChange={month => {
              const newDate = setMonth(date, month);
              setDate(newDate);
              const newSelectedDate = setMonth(selectedDate, month);
              setSelectedDate(newSelectedDate);
            }}
            date={date}
          />
          <SelectYear
            date={date}
            onChange={year => {
              const newDate = setYear(date, year);
              setDate(newDate);
              const newSelectedDate = setYear(date, year);
              setSelectedDate(newSelectedDate);
            }}
            yearRangeFrom={yearRangeFrom}
            yearRangeTo={yearRangeTo}
            yearPickerType={yearPickerType}
          />
          <HeaderButton onClick={setDateNextMonth}>
            <ChevronRightIcon />
          </HeaderButton>
        </Header>
        <Body>
          <WeekLabels>
            {[...new Array(7)]
              .map((_, day) => format(setDay(new Date(), day), 'ddd'))
              .map(d => (
                <Day key={d}>{d}</Day>
              ))}
          </WeekLabels>
          {weeksInCurrentMonth.map((week, i) => (
            <WeekRow key={i}>
              {week.map(day => {
                const disabled = isDisabled(day.dateValue);
                const isSelected = isSelectedDay(day.dateValue);
                const isToday = isDayToday(day.dateValue);
                return (
                  <Day
                    key={day.label}
                    disabled={disabled}
                    onClick={disabled ? null : selectDay(day.dateValue)}
                    isInteractive={!disabled}
                    isSelected={isSelected}
                    isToday={isToday}
                  >
                    {day.label}
                    {isToday ? <TodayMarker isSelected={isSelected} /> : null}
                  </Day>
                );
              })}
            </WeekRow>
          ))}
        </Body>
      </Wrapper>
    );
  }
  return <Kalendaryo {...props} render={BasicCalendar} />;
};

type Props = {
  children?: Node,
  /** Field disabled */
  isDisabled?: boolean,
  /** Ref to apply to the inner Element */
  innerRef: Ref<*>,
  date: string,
  time: string,
  offset: string,
  htmlID: string,
  autoFocus?: boolean,
  handleDayChange: Date => void,
  handleTimeChange: Function,
  handleOffsetChange: Function,
  yearRangeFrom?: number,
  yearRangeTo?: number,
  yearPickerType?: string,
};

export const DateTimePicker = (props: Props) => {
  const { date, time, offset, htmlID, autoFocus, isDisabled, innerRef } = props;
  const {
    handleDayChange,
    handleTimeChange,
    handleOffsetChange,
    yearRangeFrom,
    yearRangeTo,
    yearPickerType,
  } = props;
  const TODAY = new Date();

  const options = [
    '-12',
    '-11',
    '-11',
    '-10',
    '-09',
    '-08',
    '-07',
    '-06',
    '-05',
    '-04',
    '-03',
    '-02',
    '-01',
    '+00',
    '+01',
    '+02',
    '+03',
    '+04',
    '+05',
    '+06',
    '+07',
    '+08',
    '+09',
    '+10',
    '+11',
    '+12',
    '+13',
    '+14',
  ].map(o => ({ value: `${o}:00`, label: `${o}:00` }));
  return (
    <div>
      <DayPicker
        autoFocus={autoFocus}
        onSelectedChange={handleDayChange}
        yearRangeFrom={yearRangeFrom}
        yearRangeTo={yearRangeTo}
        yearPickerType={yearPickerType}
        startCurrentDateAt={date ? parse(date) : TODAY}
        startSelectedDateAt={date ? parse(date) : TODAY}
      />
      <Input
        type="time"
        name="time-picker"
        value={time}
        onChange={handleTimeChange}
        disabled={isDisabled || false}
        isMultiline={false}
        ref={innerRef}
      />
      <Select
        value={offset}
        options={options}
        onChange={handleOffsetChange}
        id={`react-select-${htmlID}`}
      />
    </div>
  );
};
