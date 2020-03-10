/** @jsx jsx */
import { Node } from 'slate'

const serializeToPlaintext = nodes => {
  return nodes.map(n => Node.string(n)).join('\n')
}

const Cell = ({ data }) => {
  return data ? serializeToPlaintext(data) : null;
};

export default Cell;
