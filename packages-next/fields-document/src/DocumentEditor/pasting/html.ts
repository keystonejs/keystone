// loosely based on https://github.com/ianstormtaylor/slate/blob/d22c76ae1313fe82111317417912a2670e73f5c9/site/examples/paste-html.tsx

import { Descendant, Element } from 'slate';
import { Mark } from '../utils';
import {
  addMarksToChildren,
  getTextNodeForCurrentlyActiveMarks,
  forceDisableMarkForChildren,
} from './utils';

function getAlignmentFromElement(element: Node): 'center' | 'end' | undefined {
  const parent = element.parentElement;
  // confluence
  const attribute = parent?.getAttribute('data-align');
  // note: we don't show html that confluence would parse as alignment
  // we could change that but meh
  // (they match on div.fabric-editor-block-mark with data-align)
  if (attribute === 'center' || attribute === 'end') {
    return attribute;
  }
  if (element instanceof HTMLElement) {
    // Google docs
    const textAlign = element.style.textAlign;
    if (textAlign === 'center') {
      return 'center';
    }
    // TODO: RTL things?
    if (textAlign === 'right' || textAlign === 'end') {
      return 'end';
    }
  }
}

// See https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types
type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

const ELEMENT_TAGS: Record<
  string,
  (element: Node) => DistributiveOmit<Element, 'children'> & { children?: Descendant[] }
> = {
  A: el => ({
    type: 'link',
    href: (el as any).getAttribute('href'),
    // underline is on links in Google Docs
    children: forceDisableMarkForChildren('underline', () => deserializeChildren(el.childNodes)),
  }),
  BLOCKQUOTE: () => ({ type: 'blockquote' }),
  H1: el => ({ type: 'heading', level: 1, textAlign: getAlignmentFromElement(el) }),
  H2: el => ({ type: 'heading', level: 2, textAlign: getAlignmentFromElement(el) }),
  H3: el => ({ type: 'heading', level: 3, textAlign: getAlignmentFromElement(el) }),
  H4: el => ({ type: 'heading', level: 4, textAlign: getAlignmentFromElement(el) }),
  H5: el => ({ type: 'heading', level: 5, textAlign: getAlignmentFromElement(el) }),
  H6: el => ({ type: 'heading', level: 6, textAlign: getAlignmentFromElement(el) }),
  IMG: el => ({
    type: 'paragraph',
    children: [
      {
        text: `<img alt=${JSON.stringify(
          (el as any).getAttribute('alt') || ''
        )} src=${JSON.stringify((el as any).getAttribute('src') || '')}>`,
      },
    ],
  }),
  LI: () => ({ type: 'list-item' }),
  OL: () => ({ type: 'ordered-list' }),
  P: el => ({ type: 'paragraph', textAlign: getAlignmentFromElement(el) }),
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
  SUP: 'superscript',
  SUB: 'subscript',
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
    const { fontWeight, textDecoration, verticalAlign } = style;

    if (textDecoration === 'underline') {
      marks.add('underline');
    } else if (textDecoration === 'line-through') {
      marks.add('strikethrough');
    }
    // confluence
    if (nodeName === 'SPAN' && element.classList.contains('code')) {
      marks.add('code');
    }
    // Google Docs does weird things with <b>
    if (nodeName === 'B' && fontWeight !== 'normal') {
      marks.add('bold');
    } else if (
      typeof fontWeight === 'string' &&
      (fontWeight === 'bold' ||
        fontWeight === 'bolder' ||
        fontWeight === '1000' ||
        /^[5-9]\d{2}$/.test(fontWeight))
    ) {
      marks.add('bold');
    }
    if (style.fontStyle === 'italic') {
      marks.add('italic');
    }
    // Google Docs uses vertical align for subscript and superscript instead of <sup> and <sub>
    if (verticalAlign === 'super') {
      marks.add('superscript');
    } else if (verticalAlign === 'sub') {
      marks.add('subscript');
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
    const text = el.textContent;
    if (!text?.trim()) {
      return [];
    }
    return [getTextNodeForCurrentlyActiveMarks(text)];
  }
  if (el.nodeType !== 1) {
    return [];
  }
  let { nodeName } = el;
  if (nodeName === 'BR') {
    return [getTextNodeForCurrentlyActiveMarks('\n')];
  }

  const marks = marksFromElementAttributes(el);

  // Dropbox Paper displays blockquotes as lists for some reason
  if (el instanceof globalThis.Element && el.classList.contains('listtype-quote')) {
    marks.delete('italic');
    nodeName = 'BLOCKQUOTE';
  }

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
