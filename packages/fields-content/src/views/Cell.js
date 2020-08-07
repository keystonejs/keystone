/** @jsx jsx */
import Plain from 'slate-plain-serializer';
const Cell = props => {
  if (!props.data) return null;
  return Plain.serialize(props.data);
};

export default Cell;
