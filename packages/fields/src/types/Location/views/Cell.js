// @flow
import type { CellProps } from '../../../types';

type Props = CellProps<string>;

const Cell = (props: Props) => {
  if (!props.data) return null;
  return props.data.formattedAddress;
};

export default Cell;
