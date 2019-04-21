// @flow

import type { CellProps } from '../../../types';

type Props = CellProps<string>;

const Cell = (props: Props) => {
  if (!props.data) {
    return null;
  }
  return props.field.options.find(option => option.value === props.data).label;
};

export default Cell;
