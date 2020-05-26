/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useCallback, useMemo } from 'react';
import { Slate, Editable, withReact } from 'slate-react';
import { createEditor, Editor, Transforms, Text } from 'slate';
import { withHistory } from 'slate-history';

import { FieldContainer, FieldLabel, FieldDescription } from '@arch-ui/fields';

/** vvvvvv */

// const Element = ({ attributes, children, element }) => {
//   switch (element.type) {
//     case 'title':
//       return <h2 {...attributes}>{children}</h2>;
//     case 'paragraph':
//       return <p {...attributes}>{children}</p>;
//   }
// };

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
    const [match] = Editor.nodes(editor, {
      match: n => n.type === 'code',
    });

    return !!match;
  },
  toggleCodeBlock(editor) {
    const isActive = DocumentEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : 'code' },
      { match: n => Editor.isBlock(editor, n) }
    );
  },

  // Event Handlers
};

const getKeyDownHandler = editor => event => {
  if (!event.ctrlKey) {
    return;
  }

  switch (event.key) {
    // When "`" is pressed, keep our existing code block logic.
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

const Toolbar = ({ editor }) => (
  <div>
    <button
      type="button"
      onMouseDown={event => {
        event.preventDefault();
        DocumentEditor.toggleBoldMark(editor);
      }}
    >
      Bold
    </button>
    <button
      type="button"
      onMouseDown={event => {
        event.preventDefault();
        DocumentEditor.toggleItalicMark(editor);
      }}
    >
      Italic
    </button>
    <button
      type="button"
      onMouseDown={event => {
        event.preventDefault();
        DocumentEditor.toggleCodeBlock(editor);
      }}
    >
      Code Block
    </button>
  </div>
);

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

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const renderElement = useCallback(props => {
    switch (props.element.type) {
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
  );
}
