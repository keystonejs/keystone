import { format } from 'date-fns';

const DateTimeCell = props => {
  if (!props.data) {
    return null;
  }
  const formatConfig = props.field.config.format;
  if (!formatConfig) {
    return props.data;
  }
  return format(props.data, formatConfig);
};

export default DateTimeCell;
