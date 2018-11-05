// @flow

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { type Node, type Ref } from 'react';
import styled from '@emotion/styled';
import Kalendaryo from 'kalendaryo';
import { isToday as isDayToday, isSameMonth } from 'date-fns';

import { ChevronLeftIcon, ChevronRightIcon } from '@keystonejs/icons';
import { borderRadius, colors } from '../theme';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Wrapper = styled.div({
  fontSize: '0.85rem',
});
const Header = styled.div({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
});
const HeaderText = styled.div({
  fontWeight: 500,
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

const DayPicker = (props: Props) => {
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

    const isSelectedDay = _date => getFormattedDate(selectedDate) === getFormattedDate(_date);
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
          <WeekLabels>
            {WEEK_DAYS.map(d => (
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

export default DayPicker;
