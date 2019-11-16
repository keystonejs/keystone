import { format, parseISO } from 'date-fns';

const CalendarDayCell = ({ data, field: { config } }) => {
  if (!data) {
    return null;
  }

  if (!config.format) {
    return data;
  }

  return format(parseISO(data), config.format);
};

export default CalendarDayCell;
