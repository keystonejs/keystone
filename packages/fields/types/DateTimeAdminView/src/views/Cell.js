// @flow
import { format } from 'date-fns';
import type { CellProps } from '@voussoir/admin-view/types';

type Props = CellProps<string>;

export const DateTimeCell = (props: Props) => {
  if (!props.data) {
    return null;
  }
  const formatConfig = props.field.config.format;
  if (!formatConfig) {
    return props.data;
  }
  return format(props.data, formatConfig);
};
