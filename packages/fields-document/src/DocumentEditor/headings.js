/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Editor, Path, Transforms } from 'slate';
import { paragraphElement } from './paragraphs';
import { getBlockAboveSelection } from './utils';

export const HeadingElement = ({ attributes, children, level }) => {
  const Tag = `h${level}`;
  return <Tag {...attributes}>{children}</Tag>;
};

export const withHeadings = editor => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    const [block] = getBlockAboveSelection(editor);

    // If it's a heading element, then toggle the block upon inserting a break
    if (block) {
      const headings = Editor.above(editor, { match: n => /^heading-(1|2|3)$/.test(n.type) });
      if (headings) {
        const [, path] = headings;
        Transforms.insertNodes(editor, paragraphElement, {
          at: Path.next(path),
          select: true,
        });
        return;
      }
    }
    insertBreak();
  };
  return editor;
};
