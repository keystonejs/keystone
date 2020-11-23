/** @jsx jsx */

import { jsx } from '@keystone-ui/core';

import { ReactEditor, useSlate } from 'slate-react';

import { Fragment, ReactNode, useState } from 'react';

import { Editor, Transforms } from 'slate';

import { Button, Spacer } from './components';
import { LinkButton } from './link';
import { insertPanel } from './panel';
import { insertQuote } from './quote';
import { BlockComponentsButtons } from './component-blocks';
import { Mark, isMarkActive, onlyContainerNodeInCurrentSelection, toggleMark } from './utils';
import { HoverableElement } from './components/hoverable';
import { insertColumns } from './columns';
import { ListButton } from './lists';
import { insertBlockquote } from './blockquote';
import { RelationshipButton } from './relationship';
import { DocumentFeatures } from '../views';
import { useControlledPopover } from '@keystone-ui/popover';

function getCanDoAlignment(editor: ReactEditor) {
  const [node] = Editor.nodes(editor, {
    match: node => node.type === 'paragraph',
  });
  return !!node;
}

// TODO use icons for toolbar buttons, make it sticky, etc
export const Toolbar = ({ documentFeatures }: { documentFeatures: DocumentFeatures }) => {
  const editor = useSlate();
  const shouldInsertBlock = onlyContainerNodeInCurrentSelection(editor);
  const canDoAlignment = getCanDoAlignment(editor);
  return (
    <ToolbarContainer>
      {false && <pre>{JSON.stringify(editor.selection, null, 2)}</pre>}
      {!!documentFeatures.headingLevels.length && (
        <Headings headingLevels={documentFeatures.headingLevels} />
      )}
      {documentFeatures.listTypes.unordered && (
        <ListButton type="unordered-list">• List</ListButton>
      )}
      {documentFeatures.listTypes.ordered && <ListButton type="ordered-list"># List</ListButton>}
      {Object.values(documentFeatures.inlineMarks).some(x => x) && (
        <Fragment>
          <Spacer />
          <InlineTextThings marks={documentFeatures.inlineMarks} />
        </Fragment>
      )}
      <Spacer />
      {documentFeatures.link && <LinkButton />}
      <BlockComponentsButtons shouldInsertBlock={shouldInsertBlock} />
      {!!documentFeatures.columns.length && (
        <Button
          onMouseDown={event => {
            event.preventDefault();
            insertColumns(editor, documentFeatures.columns[0]);
          }}
        >
          + Columns
        </Button>
      )}
      {documentFeatures.blockTypes.panel && (
        <Button
          isDisabled={!shouldInsertBlock}
          onMouseDown={event => {
            event.preventDefault();
            insertPanel(editor);
          }}
        >
          + Panel
        </Button>
      )}
      {documentFeatures.blockTypes.blockquote && (
        <Button
          onMouseDown={event => {
            event.preventDefault();
            insertBlockquote(editor);
          }}
        >
          + Blockquote
        </Button>
      )}
      {documentFeatures.blockTypes.quote && (
        <Button
          isDisabled={!shouldInsertBlock}
          onMouseDown={event => {
            event.preventDefault();
            insertQuote(editor);
          }}
        >
          + Quote
        </Button>
      )}
      <RelationshipButton />
      {(documentFeatures.alignment.center || documentFeatures.alignment.end) && (
        <Button
          isDisabled={!canDoAlignment}
          onMouseDown={event => {
            event.preventDefault();
            Transforms.unsetNodes(editor, 'textAlign', {
              match: node => node.type === 'paragraph',
            });
          }}
        >
          Start
        </Button>
      )}
      {documentFeatures.alignment.center && (
        <Button
          isDisabled={!canDoAlignment}
          onMouseDown={event => {
            event.preventDefault();
            Transforms.setNodes(
              editor,
              { textAlign: 'center' },
              {
                match: node => node.type === 'paragraph',
              }
            );
          }}
        >
          Center
        </Button>
      )}
      {documentFeatures.alignment.end && (
        <Button
          isDisabled={!canDoAlignment}
          onMouseDown={event => {
            event.preventDefault();
            Transforms.setNodes(
              editor,
              { textAlign: 'end' },
              {
                match: node => node.type === 'paragraph',
              }
            );
          }}
        >
          End
        </Button>
      )}
    </ToolbarContainer>
  );
};

/* UI Components */

const MarkButton = ({ type, children }: { type: Mark; children: ReactNode }) => {
  const editor = useSlate();
  return (
    <Button
      isSelected={isMarkActive(editor, type)}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, type);
      }}
    >
      {children}
    </Button>
  );
};

const ToolbarContainer = ({ children }: { children: ReactNode }) => (
  <div
    css={{
      backgroundColor: '#F7FAFC',
      borderBottom: '1px solid #E2E8F0',
      borderTop: '1px solid #E2E8F0',
      padding: '8px 16px',
      margin: '0 -16px',
    }}
  >
    {children}
  </div>
);

const Headings = ({ headingLevels }: { headingLevels: DocumentFeatures['headingLevels'] }) => {
  const [showHeadings, updateShowHeadings] = useState(false);
  const editor = useSlate();
  const { dialog, trigger } = useControlledPopover({
    isOpen: showHeadings,
    onClose: () => updateShowHeadings(false),
  });
  return (
    <div
      css={{
        display: 'inline-block',
        position: 'relative',
      }}
    >
      <Button
        {...trigger.props}
        ref={trigger.ref}
        onMouseDown={event => {
          event.preventDefault();
          updateShowHeadings(!showHeadings);
        }}
      >
        Heading
      </Button>
      {showHeadings ? (
        <HoverableElement ref={dialog.ref} {...dialog.props}>
          {headingLevels.map(hNum => {
            let [node] = Editor.nodes(editor, {
              match: n => n.type === 'heading' && n.level === hNum,
            });
            let isActive = !!node;
            return (
              <Button
                isSelected={isActive}
                onMouseDown={event => {
                  event.preventDefault();
                  Transforms.setNodes(
                    editor,
                    isActive
                      ? {
                          type: 'paragraph',
                          level: undefined,
                        }
                      : { type: 'heading', level: hNum }
                  );

                  updateShowHeadings(false);
                }}
              >
                H{hNum}
              </Button>
            );
          })}
        </HoverableElement>
      ) : null}
    </div>
  );
};

const InlineTextThings = ({ marks }: { marks: DocumentFeatures['inlineMarks'] }) => (
  <Fragment>
    {marks.bold && (
      <MarkButton type="bold">
        <span css={{ fontWeight: 'bold' }}>B</span>
      </MarkButton>
    )}
    {marks.italic && (
      <MarkButton type="italic">
        <span css={{ fontStyle: 'italic' }}>I</span>
      </MarkButton>
    )}
    {marks.underline && (
      <MarkButton type="underline">
        <span css={{ textDecoration: 'underline' }}>U</span>
      </MarkButton>
    )}
    {marks.strikethrough && (
      <MarkButton type="strikethrough">
        <span css={{ textDecoration: 'line-through' }}>S</span>
      </MarkButton>
    )}
    {marks.code && (
      <MarkButton type="code">
        <span css={{ fontFamily: 'monospace' }}>C</span>
      </MarkButton>
    )}
  </Fragment>
);
