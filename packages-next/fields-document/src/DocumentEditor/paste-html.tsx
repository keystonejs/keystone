// based on https://github.com/ianstormtaylor/slate/blob/228f4fa94f61f42ca41feae2b3029ebb570e0480/site/examples/paste-html.tsx

import { Transforms, Text } from 'slate';
import { ReactEditor } from 'slate-react';
import { Mark } from './utils';

const ELEMENT_TAGS: Record<string, (element: Node) => Record<string, any>> = {
  A: el => ({ type: 'link', url: (el as any).getAttribute('href') }),
  BLOCKQUOTE: () => ({ type: 'blockquote' }),
  H1: () => ({ type: 'heading', level: 1 }),
  H2: () => ({ type: 'heading', level: 2 }),
  H3: () => ({ type: 'heading', level: 3 }),
  H4: () => ({ type: 'heading', level: 4 }),
  H5: () => ({ type: 'heading', level: 5 }),
  H6: () => ({ type: 'heading', level: 6 }),
  //   IMG: (el: HTMLElement) => ({ type: 'image', url: el.getAttribute('src') }),
  LI: () => ({ type: 'list-item' }),
  OL: () => ({ type: 'ordered-list' }),
  P: () => ({ type: 'paragraph' }),
  PRE: () => ({ type: 'code' }),
  UL: () => ({ type: 'unordered-list' }),
  HR: () => ({ type: 'divider', children: [{ text: '' }] }),
};

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS: Record<string, (element: Node) => { [Key in Mark]?: true }> = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  S: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
};

const deserialize = (el: Node): any => {
  if (el.nodeType === 3) {
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === 'BR') {
    return '\n';
  }

  const { nodeName } = el;
  let parent = el;

  if (nodeName === 'PRE' && el.childNodes[0] && el.childNodes[0].nodeName === 'CODE') {
    parent = el.childNodes[0];
  }
  let children = Array.from(parent.childNodes).map(deserialize).flat();

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el);
    let newChildren: Text[] = [];
    children.forEach(child => {
      if (typeof child === 'string') {
        newChildren.push({ text: child, ...attrs });
      }
    });
    return newChildren;
  }

  children = children.map(x => (typeof x === 'string' ? { text: x } : x));

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el);
    return { ...attrs, children: children.length === 0 ? [{ text: '' }] : children };
  }

  return children;
};

export function withHtml(editor: ReactEditor) {
  const { insertData } = editor;

  editor.insertData = data => {
    const html = data.getData('text/html');

    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      const fragment = deserialize(parsed.body);
      Transforms.insertFragment(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
}
