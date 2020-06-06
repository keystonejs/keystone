/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useCallback, useMemo } from 'react';
import { Slate, Editable, ReactEditor, useSlate, withReact } from 'slate-react';
import { createEditor, Editor, Transforms, Text } from 'slate';
import { withHistory } from 'slate-history';

import { FieldContainer, FieldLabel, FieldDescription } from '@arch-ui/fields';

const Button = ({ isPressed, ...props }) => (
  <button
    type="button"
    css={{
      background: isPressed ? '#f3f3f3' : 'white',
      borderColor: isPressed ? '#aaa' : '#ccc',
      borderStyle: 'solid',
      borderWidth: 1,
      borderRadius: 5,
      boxShadow: isPressed ? 'inset 0px 3px 5px -4px rgba(0,0,0,0.50)' : undefined,
      marginRight: 4,
      ':hover': {
        borderColor: isPressed ? '#666' : '#999',
      },
    }}
    {...props}
  />
);

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
      { type: isActive ? null : 'code' },
      { match: n => Editor.isBlock(editor, n) }
    );
  },

  // Access Boundary
  insertAccessBoundary(editor) {
    if (isBlockActive(editor, 'access-boundary')) return;
    const children = [{ type: 'i', text: 'one' }, { text: 'two' }];
    const boundary = { type: 'access-boundary', roles: [], children };
    Transforms.insertNodes(editor, boundary);
  },
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  });

  return !!match;
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
    <div>
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
        onMouseDown={event => {
          event.preventDefault();
          DocumentEditor.insertAccessBoundary(editor);
        }}
      >
        access
      </Button>
    </div>
  );
};

/* Block Elements */

const accessRoles = ['public', 'member', 'admin'];

const AccessBoundaryElement = ({ attributes, children, element }) => {
  const editor = useSlate();
  const elementRoles = Array.isArray(element.roles) ? element.roles : [];
  return (
    <div
      css={{
        margin: '8px 0',
        border: '3px dashed #eee',
        borderRadius: 5,
      }}
      {...attributes}
    >
      <div
        contentEditable={false}
        style={{
          backgroundColor: '#f9f9f9',
          borderBottom: '1px solid #eee',
          padding: 8,
          userSelect: 'none',
        }}
      >
        <span css={{ marginRight: 8 }}>Restrict to:</span>
        {accessRoles.map(role => {
          const roleIsSelected = elementRoles.includes(role);
          return (
            <Button
              key={role}
              isPressed={roleIsSelected}
              onMouseDown={event => {
                event.preventDefault();
                const path = ReactEditor.findPath(editor, element);
                const newRoles = roleIsSelected
                  ? elementRoles.filter(i => i !== role)
                  : [...elementRoles, role];
                Transforms.setNodes(editor, { roles: newRoles }, { at: path });
              }}
            >
              {role}
            </Button>
          );
        })}
      </div>
      <div css={{ padding: 8 }}>{children}</div>
    </div>
  );
};

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

const withAccess = editor => {
  const { insertBreak } = editor;
  editor.insertBreak = () => {
    const { selection } = editor;

    if (selection) {
      const [boundary] = Editor.nodes(editor, { match: n => n.type === 'access-boundary' });

      if (boundary) {
        console.log('inside access boundary');
        return;
      }
    }

    insertBreak();
  };
  return editor;
};

export default function DocumentField({ field, errors, value, onChange, isDisabled }) {
  const htmlID = `ks-input-${field.path}`;
  const accessError = errors.find(
    error => error instanceof Error && error.name === 'AccessDeniedError'
  );

  const editor = useMemo(() => withAccess(withHistory(withReact(createEditor()))), []);

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'access-boundary':
        return <AccessBoundaryElement {...props} />;
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
