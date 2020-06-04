import {
  isSameMonth,
  startOfMonth,
  eachDayOfInterval,
  addWeeks,
  startOfWeek,
  endOfWeek,
  getDate,
} from 'date-fns';
import { useRef, useEffect } from 'react';

export const yearRange = (from, to) => {
  const years = [];
  let year = from;
  while (year <= to) {
    years.push(year++);
  }
  return years;
};

export const months = Array.from({ length: 12 }, (_, i) => i);

// https://github.com/geeofree/kalendaryo/blob/master/src/index.js#L245-L279

function createDayObject(dateValue) {
  return {
    dateValue,
    label: getDate(dateValue),
  };
}

export function getWeeksInMonth(date) {
  const weekOptions = { weekStartsOn: 0 };
  const firstDayOfMonth = startOfMonth(date);
  const firstDayOfFirstWeek = startOfWeek(firstDayOfMonth, weekOptions);
  const lastDayOfFirstWeek = endOfWeek(firstDayOfMonth, weekOptions);

  const getWeeks = (startDay, endDay, weekArray) => {
    const week = eachDayOfInterval({ start: startDay, end: endDay }).map(createDayObject);
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

export function isNumberInRange(num, start, end) {
  return num >= start && num <= end;
}

export function usePrevious(value) {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
