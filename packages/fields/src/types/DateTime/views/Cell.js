import { format, parseISO } from 'date-fns';

const DateTimeCell = props => {
  if (!props.data) {
    return null;
  }
  const formatConfig = props.field.config.format;
  if (!formatConfig) {
    return props.data;
  }
  return format(parseISO(props.data), formatConfig);
};

export default DateTimeCell;
