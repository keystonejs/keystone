import { Text } from 'slate';
import { Mark } from '../utils';

// a v important note
// marks in the markdown ast/html are represented quite differently to how they are in slate
// if you had the markdown **something https://keystonejs.com something**
// the bold node is the parent of the link node
// but in slate, marks are only represented on text nodes

const currentlyActiveMarks = new Set<Mark>();

export function addMarkToChildren<T>(mark: Mark, cb: () => T): T {
  const wasPreviouslyActive = currentlyActiveMarks.has(mark);
  currentlyActiveMarks.add(mark);
  try {
    return cb();
  } finally {
    if (!wasPreviouslyActive) {
      currentlyActiveMarks.delete(mark);
    }
  }
}

export function getTextNodeForCurrentlyActiveMarks(text: string) {
  const node: Text = { text };
  for (const mark of currentlyActiveMarks) {
    node[mark] = true;
  }
  return node;
}
