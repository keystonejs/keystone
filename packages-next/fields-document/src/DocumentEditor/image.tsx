import React from 'react';
import { ReactEditor, RenderElementProps, useSlate } from 'slate-react';
import { Editor, Range, Transforms } from 'slate';
// @ts-ignore
import isUrl from 'is-url';

import { Button } from './components';

const insertImage = (editor: ReactEditor, url: string) => {
  if (editor.selection) {
    wrapImage(editor, url);
  }
};

const isImageActive = (editor: ReactEditor) => {
  const [image] = Editor.nodes(editor, { match: n => n.type === 'image' });
  return !!image;
};

const unwrapImage = (editor: ReactEditor) => {
  Transforms.unwrapNodes(editor, { match: n => n.type === 'image' });
};

const wrapImage = (editor: ReactEditor, url: string) => {
  if (isImageActive(editor)) {
    unwrapImage(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const image = {
    type: 'image',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, image);
  } else {
    Transforms.wrapNodes(editor, image, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

export const ImageElement = ({ attributes, children, element }: RenderElementProps) => (
  <a {...attributes} href={element.url as string}>
    {children}
  </a>
);

export const ImageButton = () => {
  const editor = useSlate();
  return (
    <Button
      active={isImageActive(editor)}
      onMouseDown={event => {
        event.preventDefault();
        const url = window.prompt('Enter the URL of the image:');
        if (!url) return;
        insertImage(editor, url);
      }}
    >
      image
    </Button>
  );
};

export const withImage = (editor: ReactEditor) => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = element => {
    return element.type === 'image' ? true : isInline(element);
  };

  editor.insertText = text => {
    if (text && isUrl(text)) {
      wrapImage(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = data => {
    const text = data.getData('text/plain');

    if (text && isUrl(text)) {
      wrapImage(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};
