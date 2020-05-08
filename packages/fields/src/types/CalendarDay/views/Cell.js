import { format, parseISO } from 'date-fns';

export default ({ data, field: { format: formatString } }) =>
  data ? (formatString ? format(parseISO(data), formatString) : data) : null;
