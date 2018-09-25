import { format } from 'date-fns';

let CalendarDayCell = props => {
  if (!props.data) {
    return null;
  }
  let formatConfig = props.field.config.format;
  if (!formatConfig) {
    return props.data;
  }
  return format(props.data, formatConfig);
};

export default CalendarDayCell;
