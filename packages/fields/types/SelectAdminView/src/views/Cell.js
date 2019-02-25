// @flow
import type { CellProps } from '@voussoir/admin-view/types';

type Props = CellProps<string>;

export const SelectCell = (props: Props) => {
  if (!props.data) {
    return null;
  }
  return props.field.options.find(option => option.value === props.data).label;
};
