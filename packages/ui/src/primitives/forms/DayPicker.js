// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { type Node, type Ref } from 'react';
import styled from '@emotion/styled';
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
  isEqual as areDatesEqual,
  addMonths,
  subMonths,
  startOfMonth,
  eachDay,
  addWeeks,
  startOfWeek,
  endOfWeek,
  getDate,
} from 'date-fns';
import { VariableSizeList as List } from 'react-window';
import { Input } from './index';
import { Select } from '../filters';
import { ChevronLeftIcon, ChevronRightIcon } from '@voussoir/icons';
import memoizeOne from 'memoize-one';
import { borderRadius, colors } from '../../theme';

const yearRange = (from, to) => {
  const years: Array<number> = [];
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

function createDayObject(dateValue) {
  return {
    dateValue,
    label: getDate(dateValue),
  };
}

type Weeks = $ReadOnlyArray<$ReadOnlyArray<{ dateValue: Date, label: string }>>;

// https://github.com/geeofree/kalendaryo/blob/master/src/index.js#L245-L279
function getWeeksInMonth(date) {
  const weekOptions = { weekStartsOn: 0 };
  const firstDayOfMonth = startOfMonth(date);
  const firstDayOfFirstWeek = startOfWeek(firstDayOfMonth, weekOptions);
  const lastDayOfFirstWeek = endOfWeek(firstDayOfMonth, weekOptions);

  const getWeeks = (startDay, endDay, weekArray: Weeks): Weeks => {
    const week = eachDay(startDay, endDay).map(createDayObject);
    const weeks = [...weekArray, week];
    const nextWeek = addWeeks(startDay, 1);

    const firstDayNextWeek = startOfWeek(nextWeek, weekOptions);
    const lastDayNextWeek = endOfWeek(nextWeek, weekOptions);

    if (isSameMonth(firstDayNextWeek, date)) {
      return getWeeks(firstDayNextWeek, lastDayNextWeek, weeks);
    }

    return weeks;
  };

  return getWeeks(firstDayOfFirstWeek, lastDayOfFirstWeek, []);
}

const SelectMonth = ({ onChange, date }: SelectMonthProps) => {
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
};

type YearPickerType = 'auto' | 'input';

type SelectYearProps = {
  onChange: number => mixed,
  date: Date,
  yearRangeFrom?: number,
  yearRangeTo?: number,
  yearPickerType: YearPickerType,
};

const SelectYear = ({
  onChange,
  date,
  yearRangeFrom = getYear(new Date()) - 100,
  yearRangeTo = getYear(new Date()),
  yearPickerType = 'auto',
}: SelectYearProps) => {
  const years = yearRange(yearRangeFrom, yearRangeTo);

  if ((years.length > 50 && yearPickerType === 'auto') || yearPickerType === 'input') {
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
};

type DayPickerProps = {
  onSelectedChange: Date => void,
  yearRangeFrom: number,
  yearRangeTo: number,
  yearPickerType: YearPickerType,
  startCurrentDateAt: Date,
  startSelectedDateAt: Date,
};

type DayPickerState = {
  date: Date,
  selectedDate: Date,
};

let DAY_HEIGHT = 32.5;

let months = Array.from({ length: 12 }, (_, i) => i);

let readableMonths = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const Month = ({ style, index, data }) => {
  const { items, selectedDate, setSelectedDate } = data;
  const { weeks, month, year } = items[index];
  return (
    <div style={style}>
      <div
        css={{
          position: 'sticky',
          top: 0,
          width: '100%',
          backgroundColor: '#fff',
        }}
      >
        {/*if you're going to change the styles here make sure
           to update the size in the itemSize prop above */}
        <div
          css={{
            paddingTop: 4,
            paddingBottom: 4,
            border: `1px ${colors.N60} solid`,
            borderLeft: 0,
            borderRight: 0,
            display: 'flex',
            justifyContent: 'space-between',
            paddingRight: 12,
          }}
        >
          <span
            css={{
              color: colors.N60,
            }}
          >
            {readableMonths[month]}
          </span>
          <span
            css={{
              color: colors.N60,
            }}
          >
            {year}
          </span>
        </div>
      </div>
      {weeks.map((week, i) => (
        <WeekRow key={i}>
          {week.map(day => {
            const date = new Date(year, month, 3);
            const disabled = !isSameMonth(date, day.dateValue);
            const isSelected = !disabled && areDatesEqual(selectedDate, day.dateValue);
            const isToday = isDayToday(day.dateValue);
            return (
              <Day
                key={day.label}
                disabled={disabled}
                onClick={disabled ? null : () => setSelectedDate(day.dateValue)}
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
    </div>
  );
};

export class DayPicker extends React.Component<DayPickerProps, DayPickerState> {
  state = {
    date: this.props.startCurrentDateAt,
    selectedDate: this.props.startSelectedDateAt,
  };
  listRef = React.createRef();
  static defaultProps = {
    yearRangeFrom: getYear(new Date()) - 100,
    yearRangeTo: getYear(new Date()),
    yearPickerType: 'auto',
  };
  componentDidUpdate(prevProps: DayPickerProps, prevState: DayPickerState) {
    const selectedDateChanged = !areDatesEqual(prevState.selectedDate, this.state.selectedDate);
    if (selectedDateChanged) {
      this.props.onSelectedChange(this.state.selectedDate);
    }
  }
  componentDidMount() {
    this.scrollToDate(this.props.startCurrentDateAt);
  }

  scrollToDate(date: Date) {
    const list = this.listRef.current;
    if (list !== null) {
      const month = date.getMonth();
      const year = getYear(date);
      // calculate the index instead of using indexOf because this is much cheaper
      const index = (year - this.props.yearRangeFrom) * 12 + month;
      list.scrollToItem(index, 'start');
    }
  }

  getItems = memoizeOne((yearRangeFrom: number, yearRangeTo: number) => {
    const years = yearRange(yearRangeFrom, yearRangeTo);

    const items: Array<{ year: number, month: number, weeks: Weeks }> = [];

    years.forEach(year => {
      months.forEach(month => {
        items.push({
          year,
          month,
          weeks: getWeeksInMonth(new Date(year, month, 1)),
        });
      });
    });
    return { years, items };
  });

  render() {
    const { yearRangeFrom, yearRangeTo, yearPickerType } = this.props;

    const setDate = date => {
      this.setState({ date }, () => {
        this.scrollToDate(date);
      });
    };
    const setSelectedDate = selectedDate => {
      this.setState({ selectedDate });
    };

    const { selectedDate, date } = this.state;

    const setDateNextMonth = () => {
      setDate(addMonths(date, 1));
    };
    const setDatePrevMonth = () => {
      setDate(subMonths(date, 1));
    };

    const { years, items } = this.getItems(yearRangeFrom, yearRangeTo);

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
            }}
            date={date}
          />
          <SelectYear
            date={date}
            onChange={year => {
              const newDate = setYear(date, year);
              setDate(newDate);
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

          <List
            ref={this.listRef}
            onItemsRendered={({ visibleStartIndex }) => {
              const item = items[visibleStartIndex];
              this.setState({ date: new Date(item.year, item.month, 1) });
            }}
            itemSize={index => {
              const { weeks } = items[index];
              return weeks.length * DAY_HEIGHT + 26.5;
            }}
            // memoize the creation of this object later and probably make Month memoized
            itemData={{ items, selectedDate, setSelectedDate }}
            height={6 * DAY_HEIGHT + 26.5}
            itemCount={years.length * 12}
            width="100%"
          >
            {Month}
          </List>
        </Body>
      </Wrapper>
    );
  }
}

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
  yearPickerType?: YearPickerType,
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
