import { format } from 'date-fns';

const CalendarDayCell = ({ data, field: { config } }) => {
  if (!data) {
    return null;
  }

  if (!config.format) {
    return data;
  }

  return format(data, config.format);
};

export default CalendarDayCell;
