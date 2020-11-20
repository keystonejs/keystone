import { format } from 'date-fns';

export function formatDateObj(date: Date) {
  // using this over toLocaleDateString because it formats 0020-01-01 as 1/1/20
  // which people might think means 2020-01-01 which could be confusing.
  // this formats 0020-01-01 as 01/01/0020
  return format(date, 'dd/MM/yyyy');
}
