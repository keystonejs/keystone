// loosely based on https://github.com/ianstormtaylor/slate/blob/d22c76ae1313fe82111317417912a2670e73f5c9/site/examples/paste-html.tsx

import { Descendant } from 'slate';
import { Mark } from '../utils';
import { addMarksToChildren, getTextNodeForCurrentlyActiveMarks } from './utils';

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

const TEXT_TAGS: Record<string, Mark> = {
  CODE: 'code',
  DEL: 'strikethrough',
  S: 'strikethrough',
  STRIKE: 'strikethrough',
  EM: 'italic',
  I: 'italic',
  STRONG: 'bold',
  U: 'underline',
};

function marksFromElementAttributes(element: Node) {
  const marks = new Set<Mark>();
  if (element instanceof HTMLElement) {
    const style = element.style;
    const { nodeName } = element;
    const markFromNodeName = TEXT_TAGS[nodeName];
    if (markFromNodeName) {
      marks.add(markFromNodeName);
    }

    const textDecoration = style.textDecoration;
    if (textDecoration === 'underline') {
      marks.add('underline');
    } else if (textDecoration === 'line-through') {
      marks.add('strikethrough');
    }
    // Google Docs does weird things with <b>
    if (nodeName === 'B' && style.fontWeight !== 'normal') {
      marks.add('bold');
    }
  }
  return marks;
}

export function deserializeHTML(html: string) {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  return deserializeHTMLNode(parsed.body);
}

export function deserializeHTMLNode(el: Node): Descendant[] {
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

  const marks = marksFromElementAttributes(el);

  return addMarksToChildren(marks, () => {
    if (ELEMENT_TAGS[nodeName]) {
      const attrs = ELEMENT_TAGS[nodeName](el);
      if (attrs.children) {
        return [attrs as any];
      }
      let children = deserializeChildren(el.childNodes);

      return [{ ...attrs, children: children }];
    }

    return deserializeChildren(el.childNodes);
  });
}

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
