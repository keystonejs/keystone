// @flow
import {
  isSameMonth,
  startOfMonth,
  eachDay,
  addWeeks,
  startOfWeek,
  endOfWeek,
  getDate,
} from 'date-fns';

export const yearRange = (from: number, to: number) => {
  const years: Array<number> = [];
  let year = from;
  while (year <= to) {
    years.push(year++);
  }
  return years;
};

export const months: Array<number> = Array.from({ length: 12 }, (_, i) => i);

export type Weeks = $ReadOnlyArray<$ReadOnlyArray<{ dateValue: Date, label: string }>>;

// https://github.com/geeofree/kalendaryo/blob/master/src/index.js#L245-L279

function createDayObject(dateValue) {
  return {
    dateValue,
    label: getDate(dateValue),
  };
}

export function getWeeksInMonth(date: Date) {
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

export function isNumberInRange(num: number, start: number, end: number) {
  return num >= start && num <= end;
}
