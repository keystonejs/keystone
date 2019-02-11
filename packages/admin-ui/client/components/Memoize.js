// @flow
import { useMemo, type Node } from 'react';

export function Memoize({ children, deps }: { children: () => Node, deps: Array<any> }) {
  return useMemo(children, deps);
}
