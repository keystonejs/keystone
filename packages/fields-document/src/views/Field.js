/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useCallback, useMemo } from 'react';
import { Slate, Editable, useSlate, withReact } from 'slate-react';
import { createEditor, Editor, Transforms, Text } from 'slate';
import { withHistory } from 'slate-history';

import { FieldContainer, FieldLabel, FieldDescription } from '@arch-ui/fields';

import {
  AccessBoundaryElement,
  insertAccessBoundary,
  isInsideAccessBoundary,
  withAccess,
} from '../DocumentEditor/access';
import { Button } from '../DocumentEditor/components';
import { DocumentFeaturesContext } from '../DocumentEditor/documentFeatures';
import { isInsidePanel, insertPanel, PanelElement } from '../DocumentEditor/panel';
import { withParagraphs } from '../DocumentEditor/paragraphs';
import { isBlockActive } from '../DocumentEditor/utils';

const DocumentEditor = {
  // Bold
  isBoldMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.bold === true,
      universal: true,
    });

    return !!match;
  },
  toggleBoldMark(editor) {
    const isActive = DocumentEditor.isBoldMarkActive(editor);
    Transforms.setNodes(
      editor,
      { bold: isActive ? null : true },
      { match: n => Text.isText(n), split: true }
    );
  },

  // Italic
  isItalicMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.italic === true,
      universal: true,
    });

    return !!match;
  },
  toggleItalicMark(editor) {
    const isActive = DocumentEditor.isItalicMarkActive(editor);
    Transforms.setNodes(
      editor,
      { italic: isActive ? null : true },
      { match: n => Text.isText(n), split: true }
    );
  },

  // Code
  isCodeBlockActive(editor) {
    return isBlockActive(editor, 'code');
  },
  toggleCodeBlock(editor) {
    const isActive = DocumentEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? 'paragraph' : 'code' },
      { match: n => Editor.isBlock(editor, n) }
    );
  },
};

const getKeyDownHandler = editor => event => {
  if (!event.ctrlKey) {
    return;
  }

  switch (event.key) {
    case '`': {
      event.preventDefault();
      DocumentEditor.toggleCodeBlock(editor);
      break;
    }

    case 'b': {
      event.preventDefault();
      DocumentEditor.toggleBoldMark(editor);
      break;
    }

    case 'i': {
      event.preventDefault();
      DocumentEditor.toggleItalicMark(editor);
      break;
    }
  }
};

/* UI Components */

const Toolbar = () => {
  const editor = useSlate();
  return (
    <div
      css={{
        backgroundColor: '#f9f9f9',
        borderBottom: '1px solid #eee',
        borderTop: '1px solid #eee',
        padding: '8px 16px',
        margin: '0 -16px',
      }}
    >
      <Button
        isPressed={DocumentEditor.isBoldMarkActive(editor)}
        onMouseDown={event => {
          event.preventDefault();
          DocumentEditor.toggleBoldMark(editor);
        }}
      >
        Bold
      </Button>
      <Button
        isPressed={DocumentEditor.isItalicMarkActive(editor)}
        onMouseDown={event => {
          event.preventDefault();
          DocumentEditor.toggleItalicMark(editor);
        }}
      >
        Italic
      </Button>
      <Button
        isPressed={DocumentEditor.isCodeBlockActive(editor)}
        onMouseDown={event => {
          event.preventDefault();
          DocumentEditor.toggleCodeBlock(editor);
        }}
      >
        Code
      </Button>
      <Button
        isDisabled={isInsideAccessBoundary(editor)}
        onMouseDown={event => {
          event.preventDefault();
          insertAccessBoundary(editor);
        }}
      >
        + Access Boundary
      </Button>
      <Button
        isDisabled={isInsidePanel(editor)}
        onMouseDown={event => {
          event.preventDefault();
          insertPanel(editor);
        }}
      >
        + Panel
      </Button>
    </div>
  );
};

/* Block Elements */

const CodeElement = props => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

const DefaultElement = props => {
  return <p {...props.attributes}>{props.children}</p>;
};

/* Leaf Elements */

const Leaf = props => {
  return (
    <span
      {...props.attributes}
      style={{
        fontWeight: props.leaf.bold ? 'bold' : 'normal',
        fontStyle: props.leaf.italic ? 'italic' : 'normal',
      }}
    >
      {props.children}
    </span>
  );
};

export default function DocumentField({ field, errors, value, onChange, isDisabled }) {
  const htmlID = `ks-input-${field.path}`;
  const accessError = errors.find(
    error => error instanceof Error && error.name === 'AccessDeniedError'
  );
  const { documentFeatures } = field.config;

  // TODO: skip withAccess if documentFeatures.access is not defined
  const editor = useMemo(
    () => withParagraphs(withAccess(withHistory(withReact(createEditor())))),
    []
  );

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'access-boundary':
        return <AccessBoundaryElement {...props} />;
      case 'panel':
        return <PanelElement {...props} />;
      case 'code':
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />;
  }, []);

  const onKeyDown = useMemo(() => getKeyDownHandler(editor), [editor]);

  if (accessError) return null;

  return (
    <DocumentFeaturesContext.Provider value={documentFeatures}>
      <FieldContainer>
        <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
        <FieldDescription text={field.adminDoc} />
        <Slate editor={editor} value={value} onChange={onChange}>
          <Toolbar editor={editor} />
          <Editable
            autoFocus
            onKeyDown={onKeyDown}
            readOnly={isDisabled}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
          />
        </Slate>
      </FieldContainer>
    </DocumentFeaturesContext.Provider>
  );
}
