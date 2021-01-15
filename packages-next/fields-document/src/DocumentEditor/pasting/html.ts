// loosely based on https://github.com/ianstormtaylor/slate/blob/d22c76ae1313fe82111317417912a2670e73f5c9/site/examples/paste-html.tsx

import { Descendant } from 'slate';
import { Mark } from '../utils';
import { addMarkToChildren, getTextNodeForCurrentlyActiveMarks } from './utils';

const ELEMENT_TAGS: Record<string, (element: Node) => Record<string, any>> = {
  A: el => ({ type: 'link', url: (el as any).getAttribute('href') }),
  BLOCKQUOTE: () => ({ type: 'blockquote' }),
  H1: () => ({ type: 'heading', level: 1 }),
  H2: () => ({ type: 'heading', level: 2 }),
  H3: () => ({ type: 'heading', level: 3 }),
  H4: () => ({ type: 'heading', level: 4 }),
  H5: () => ({ type: 'heading', level: 5 }),
  H6: () => ({ type: 'heading', level: 6 }),
  IMG: el => ({
    type: 'paragraph',
    children: [{ text: `<img src=${JSON.stringify((el as any).getAttribute('src') || '')}>` }],
  }),
  LI: () => ({ type: 'list-item' }),
  OL: () => ({ type: 'ordered-list' }),
  P: () => ({ type: 'paragraph' }),
  PRE: () => ({ type: 'code' }),
  UL: () => ({ type: 'unordered-list' }),
  HR: () => ({ type: 'divider', children: [{ text: '' }] }),
};

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS: Record<string, Mark> = {
  CODE: 'code',
  DEL: 'strikethrough',
  S: 'strikethrough',
  EM: 'italic',
  I: 'italic',
  STRONG: 'bold',
  U: 'underline',
};

export function deserializeHTML(html: string) {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  return deserializeHTMLNode(parsed.body);
}

export const deserializeHTMLNode = (el: Node): Descendant[] => {
  if (el.nodeType === 3) {
    return [getTextNodeForCurrentlyActiveMarks(el.textContent || '')];
  }
  if (el.nodeType !== 1) {
    return [];
  }
  const { nodeName } = el;
  if (nodeName === 'BR') {
    return [getTextNodeForCurrentlyActiveMarks('\n')];
  }

  if (TEXT_TAGS[nodeName]) {
    return addMarkToChildren(TEXT_TAGS[nodeName], () => deserializeChildren(el.childNodes));
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el);
    if (attrs.children) {
      return [attrs as any];
    }
    let children = deserializeChildren(el.childNodes);

    return [{ ...attrs, children: children }];
  }

  return deserializeChildren(el.childNodes);
};

function deserializeChildren(nodes: Iterable<Node>) {
  const outputNodes: Descendant[] = [];
  for (const node of nodes) {
    const result = deserializeHTMLNode(node);
    if (result.length) {
      outputNodes.push(...result);
    }
  }
  if (!outputNodes.length) {
    outputNodes.push({ text: '' });
  }
  return outputNodes;
}
