/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useCallback, useMemo } from 'react';
import { Slate, Editable, ReactEditor, useSlate, withReact } from 'slate-react';
import { createEditor, Editor, Transforms, Text, Element, Path, Node, Range } from 'slate';
import { withHistory } from 'slate-history';

import { FieldContainer, FieldLabel, FieldDescription } from '@arch-ui/fields';

const Button = ({ isDisabled, isPressed, ...props }) => (
  <button
    type="button"
    disabled={isDisabled}
    css={{
      background: isPressed ? '#f3f3f3' : 'white',
      borderColor: isDisabled ? '#eee' : isPressed ? '#aaa' : '#ccc',
      borderStyle: 'solid',
      borderWidth: 1,
      borderRadius: 5,
      boxShadow: isPressed ? 'inset 0px 3px 5px -4px rgba(0,0,0,0.50)' : undefined,
      color: isDisabled ? '#999' : '#172B4D',
      marginRight: 4,
      pointerEvents: isDisabled ? 'none' : undefined,
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
    </div>
  );
};

/* Paragraphs */

const withParagraphs = editor => {
  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    const [node, path] = entry;

    // If the element is a paragraph, ensure its children are valid.
    if (Element.isElement(node)) {
      if (!node.type) {
        Transforms.setNodes(editor, { type: 'paragraph' }, { at: path });
        return;
      }
      if (!node.type || node.type === 'paragraph') {
        for (const [child, childPath] of Node.children(editor, path)) {
          if (Element.isElement(child) && !editor.isInline(child)) {
            Transforms.unwrapNodes(editor, { at: childPath });
            return;
          }
        }
      }
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry);
  };

  return editor;
};

/* Access Control */

const ROLES = [
  { label: 'Public', value: 'public' },
  { label: 'Members', value: 'member' },
  { label: 'Admins', value: 'admin' },
];

const getBlockAboveSelection = editor =>
  Editor.above(editor, {
    match: n => Editor.isBlock(editor, n),
  }) || [editor, []];

const isBlockTextEmpty = node => {
  const lastChild = node.children[node.children.length - 1];
  return Text.isText(lastChild) && !lastChild.text.length;
};

// Access Boundary
const isInsideAccessBoundary = editor => {
  return isBlockActive(editor, 'access-boundary');
};
const insertAccessBoundary = editor => {
  if (isBlockActive(editor, 'access-boundary')) return;
  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const [block] = getBlockAboveSelection(editor);
  if (!!block && isCollapsed && isBlockTextEmpty(block)) {
    const element = { type: 'access-boundary', roles: [], children: [] };
    Transforms.wrapNodes(editor, element);
  } else {
    const children = [{ type: 'paragraph', children: [{ text: '' }] }];
    const element = { type: 'access-boundary', roles: [], children };
    Transforms.insertNodes(editor, element, { select: true });
  }
};

const withAccess = editor => {
  const { insertBreak } = editor;
  editor.insertBreak = () => {
    const [block] = getBlockAboveSelection(editor);

    if (block && isBlockTextEmpty(block)) {
      const accessBoundary = Editor.above(editor, {
        match: n => n.type === 'access-boundary',
      });

      if (accessBoundary) {
        const [, path] = accessBoundary;
        Transforms.insertNodes(
          editor,
          { type: 'paragraph', children: [{ text: '' }] },
          {
            at: Path.next(path),
            select: true,
          }
        );
        return;
      }
    }

    insertBreak();
  };
  return editor;
};

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
          fontSize: 14,
          color: '#d64242',
          fontWeight: 600,
          userSelect: 'none',
        }}
      >
        <span css={{ marginRight: 8 }}>Restrict to:</span>
        {ROLES.map(role => {
          const roleIsSelected = elementRoles.includes(role.value);
          return (
            <Button
              key={role.value}
              isPressed={roleIsSelected}
              onMouseDown={event => {
                event.preventDefault();
                const path = ReactEditor.findPath(editor, element);
                const newRoles = roleIsSelected
                  ? elementRoles.filter(i => i !== role.value)
                  : [...elementRoles, role.value];
                Transforms.setNodes(editor, { roles: newRoles }, { at: path });
              }}
            >
              {role.label}
            </Button>
          );
        })}
        <Button
          css={{ float: 'right' }}
          onMouseDown={event => {
            event.preventDefault();
            const path = ReactEditor.findPath(editor, element);
            Transforms.unwrapNodes(editor, { at: path });
            Transforms.select(editor, path);
            Transforms.collapse(editor, { edge: 'start' });
          }}
        >
          Remove
        </Button>
      </div>
      <div css={{ margin: 8 }}>{children}</div>
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

  const editor = useMemo(
    () => withParagraphs(withAccess(withHistory(withReact(createEditor())))),
    []
  );

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
