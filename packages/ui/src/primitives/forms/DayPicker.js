// @flow
import React, { type Node, type Ref } from 'react';
import styled from 'react-emotion';
import Kalendaryo from 'kalendaryo';
import { isToday as isDayToday, isSameMonth } from 'date-fns';

import { ChevronLeftIcon, ChevronRightIcon } from '@keystonejs/icons';
import { borderRadius, colors } from '../../theme';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Wrapper = styled.div({
  fontSize: '0.85rem',
});
const Header = styled.div({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0.5rem',
});
const HeaderText = styled.div({
  fontWeight: 500,
});
const HeaderButton = props => (
  <button
    type="button"
    css={{
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      outline: 'none',
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
const Day = styled.div(({ disabled, isInteractive, isSelected, isToday }) => ({
  backgroundColor: isSelected ? colors.primary : null,
  borderRadius: borderRadius,
  color: isSelected
    ? 'white'
    : disabled
      ? colors.N40
      : isToday
        ? colors.danger
        : null,
  cursor: isInteractive ? 'pointer' : 'default',
  fontWeight: isSelected || isToday ? 'bold' : null,
  flexBasis: 'calc(100% / 7)',
  padding: '0.66rem 0.5rem',
  textAlign: 'center',
  width: 'calc(100% / 7)',
}));

type Props = {
  children?: Node,
  /** Field disabled */
  isDisabled?: boolean,
  /** Marks this as a required field */
  isRequired?: boolean,
  /** Field name */
  name?: string,
  /** onChange event handler */
  onChange: any => mixed,
  /** Field value */
  value: string,
  /** Ref to apply to the inner Element */
  innerRef?: Ref<*>,
};

export const DayPicker = (props: Props) => {
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

    const currentDate = getFormattedDate('MMMM YYYY');
    const weeksInCurrentMonth = getWeeksInMonth();

    const setDateNextMonth = x => {
      console.log({ x });
      setDate(getDateNextMonth());
    };
    const setDatePrevMonth = () => setDate(getDatePrevMonth());
    const selectDay = _date => () => setSelectedDate(_date);

    const isSelectedDay = _date =>
      getFormattedDate(selectedDate) === getFormattedDate(_date);
    const isDisabled = dateValue => !isSameMonth(date, dateValue);

    return (
      <Wrapper>
        <Header>
          <HeaderButton onClick={setDatePrevMonth}>
            <ChevronLeftIcon />
          </HeaderButton>
          <HeaderText>{currentDate}</HeaderText>
          <HeaderButton onClick={setDateNextMonth}>
            <ChevronRightIcon />
          </HeaderButton>
        </Header>

        <Body>
          <WeekLabels>{WEEK_DAYS.map(d => <Day key={d}>{d}</Day>)}</WeekLabels>

          {weeksInCurrentMonth.map((week, i) => (
            <WeekRow key={i}>
              {week.map(day => (
                <Day
                  key={day.label}
                  disabled={isDisabled(day.dateValue)}
                  onClick={
                    isDisabled(day.dateValue) ? null : selectDay(day.dateValue)
                  }
                  isInteractive={!isDisabled(day.dateValue)}
                  isSelected={isSelectedDay(day.dateValue)}
                  isToday={isDayToday(day.dateValue)}
                >
                  {day.label}
                </Day>
              ))}
            </WeekRow>
          ))}
        </Body>
      </Wrapper>
    );
  }
  return <Kalendaryo {...props} render={BasicCalendar} />;
};
