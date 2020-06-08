/** @jsx jsx */

import { jsx } from '@emotion/core';
import isHotkey from 'is-hotkey';
import { useCallback, useMemo } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, useSlate, withReact } from 'slate-react';
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
import { isInsidePanel, insertPanel, PanelElement, withPanel } from '../DocumentEditor/panel';
import { withParagraphs } from '../DocumentEditor/paragraphs';
import { renderQuoteElement, isInsideQuote, insertQuote, withQuote } from '../DocumentEditor/quote';
import {
  // LIST_TYPES,
  isBlockActive,
  toggleBlock,
  isMarkActive,
  toggleMark,
} from '../DocumentEditor/utils';

const HOTKEYS = {
  'mod+b': { mark: 'bold' },
  'mod+i': { mark: 'italic' },
  'mod+u': { mark: 'underline' },
  'mod+`': { block: 'code' },
};

const getKeyDownHandler = editor => event => {
  for (const hotkey in HOTKEYS) {
    if (isHotkey(hotkey, event)) {
      event.preventDefault();
      const { block, mark } = HOTKEYS[hotkey];
      if (block) toggleBlock(editor, block);
      if (mark) toggleMark(editor, mark);
    }
  }
};

/* UI Components */

const MarkButton = ({ type, children }) => {
  const editor = useSlate();
  return (
    <Button
      isPressed={isMarkActive(editor, type)}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, type);
      }}
    >
      {children}
    </Button>
  );
};

const BlockButton = ({ type, children }) => {
  const editor = useSlate();
  return (
    <Button
      isDisabled={isInsideQuote(editor) || isInsidePanel(editor)}
      isPressed={isBlockActive(editor, type)}
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, type);
      }}
    >
      {children}
    </Button>
  );
};

const Spacer = () => <span css={{ display: 'inline-block', width: 8 }} />;

// TODO use icons for toolbar buttons, make it sticky, etc
const Toolbar = () => {
  const editor = useSlate();
  return (
    <div
      css={{
        backgroundColor: '#F7FAFC',
        borderBottom: '1px solid #E2E8F0',
        borderTop: '1px solid #E2E8F0',
        padding: '8px 16px',
        margin: '0 -16px',
      }}
    >
      <BlockButton type="heading-1">H1</BlockButton>
      <BlockButton type="heading-2">H2</BlockButton>
      <BlockButton type="heading-3">H3</BlockButton>
      <BlockButton type="code">Code</BlockButton>
      <BlockButton type="unordered-list">• List</BlockButton>
      <BlockButton type="ordered-list"># List</BlockButton>
      <Spacer />
      <MarkButton type="bold">Bold</MarkButton>
      <MarkButton type="italic">Italic</MarkButton>
      <Spacer />
      <Button
        isDisabled={
          isInsideAccessBoundary(editor) || isInsidePanel(editor) || isInsideQuote(editor)
        }
        onMouseDown={event => {
          event.preventDefault();
          insertAccessBoundary(editor);
        }}
      >
        + Access Boundary
      </Button>
      <Button
        isDisabled={isInsidePanel(editor) || isInsideQuote(editor)}
        onMouseDown={event => {
          event.preventDefault();
          insertPanel(editor);
        }}
      >
        + Panel
      </Button>
      <Button
        isDisabled={isInsidePanel(editor) || isInsideQuote(editor)}
        onMouseDown={event => {
          event.preventDefault();
          insertQuote(editor);
        }}
      >
        + Quote
      </Button>
    </div>
  );
};

/* Block Elements */

const CodeElement = ({ attributes, children }) => {
  return (
    <pre css={{ color: '#2C5282' }} {...attributes}>
      <code>{children}</code>
    </pre>
  );
};

const HeadingElement = ({ attributes, children, level }) => {
  const Tag = `h${level}`;
  return <Tag {...attributes}>{children}</Tag>;
};

/* Leaf Elements */

const Leaf = props => {
  return (
    <span
      {...props.attributes}
      style={{
        fontWeight: props.leaf.bold ? 'bold' : undefined,
        fontStyle: props.leaf.italic ? 'italic' : undefined,
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
  // TODO: define panel somehow as a documentFeatures plugin
  const editor = useMemo(
    () => withParagraphs(withQuote(withPanel(withAccess(withHistory(withReact(createEditor())))))),
    []
  );

  const renderElement = useCallback(props => {
    // TODO: probably use this method for the access boundary as well, is this
    // a good pattern for plugging in custom element renderers?
    const quoteElement = renderQuoteElement(props);
    if (quoteElement) return quoteElement;

    switch (props.element.type) {
      case 'access-boundary':
        return <AccessBoundaryElement {...props} />;
      case 'code':
        return <CodeElement {...props} />;
      case 'panel':
        return <PanelElement {...props} />;
      case 'heading-1':
        return <HeadingElement level={1} {...props} />;
      case 'heading-2':
        return <HeadingElement level={2} {...props} />;
      case 'heading-3':
        return <HeadingElement level={3} {...props} />;

      case 'ordered-list':
        return <ol {...props.attributes}>{props.children}</ol>;
      case 'unordered-list':
        return <ul {...props.attributes}>{props.children}</ul>;
      case 'list-item':
        return <li {...props.attributes}>{props.children}</li>;
      default:
        return <p {...props.attributes}>{props.children}</p>;
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
