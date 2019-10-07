// @flow
import type { CellProps } from '../../../types';

type Props = CellProps<Object>;

const Cell = (props: Props) => {
  if (!props.data) return null;
  return props.data.formattedAddress;
};

export default Cell;
