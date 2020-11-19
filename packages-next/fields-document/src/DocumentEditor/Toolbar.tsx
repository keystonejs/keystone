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
import { Hoverable } from './components/hoverable';
import { insertColumns } from './columns';
import { ListButton } from './lists';
import { insertBlockquote } from './blockquote';

function getCanDoAlignment(editor: ReactEditor) {
  const [node] = Editor.nodes(editor, {
    match: node => node.type === 'paragraph',
  });
  return !!node;
}

// TODO use icons for toolbar buttons, make it sticky, etc
export const Toolbar = () => {
  const editor = useSlate();
  const shouldInsertBlock = onlyContainerNodeInCurrentSelection(editor);
  const canDoAlignment = getCanDoAlignment(editor);
  return (
    <ToolbarContainer>
      <Headings />
      <ListButton type="unordered-list">• List</ListButton>
      <ListButton type="ordered-list"># List</ListButton>
      <Spacer />
      <InlineTextThings />
      <Spacer />
      <LinkButton />
      <BlockComponentsButtons shouldInsertBlock={shouldInsertBlock} />
      <Button
        onMouseDown={event => {
          event.preventDefault();
          insertColumns(editor);
        }}
      >
        + Columns
      </Button>
      <Button
        isDisabled={!shouldInsertBlock}
        onMouseDown={event => {
          event.preventDefault();
          insertPanel(editor);
        }}
      >
        + Panel
      </Button>
      <Button
        onMouseDown={event => {
          event.preventDefault();
          insertBlockquote(editor);
        }}
      >
        + Blockquote
      </Button>
      <Button
        isDisabled={!shouldInsertBlock}
        onMouseDown={event => {
          event.preventDefault();
          insertQuote(editor);
        }}
      >
        + Quote
      </Button>
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
      <Button
        isDisabled={!canDoAlignment}
        onMouseDown={event => {
          event.preventDefault();
          Transforms.setNodes(
            editor,
            // should this be end?
            // didn't do end bc IE11 doesn't support it
            // but i feel like end would probs be better
            { textAlign: 'right' },
            {
              match: node => node.type === 'paragraph',
            }
          );
        }}
      >
        End
      </Button>
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

const Headings = () => {
  const [showHeadings, updateShowHeadings] = useState(false);
  const editor = useSlate();
  return (
    <div
      css={{
        display: 'inline-block',
        position: 'relative',
      }}
    >
      <Button
        onMouseDown={event => {
          event.preventDefault();
          updateShowHeadings(!showHeadings);
        }}
      >
        Heading
      </Button>
      {showHeadings ? (
        <Hoverable styles={{ left: '100%' }}>
          {[1, 2, 3, 4].map(hNum => {
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
        </Hoverable>
      ) : null}
    </div>
  );
};

const InlineTextThings = () => (
  <Fragment>
    <MarkButton type="bold">
      <span css={{ fontWeight: 'bold' }}>B</span>
    </MarkButton>
    <MarkButton type="italic">
      <span css={{ fontStyle: 'italic' }}>I</span>
    </MarkButton>
    <MarkButton type="underline">
      <span css={{ textDecoration: 'underline' }}>U</span>
    </MarkButton>
    <MarkButton type="strikethrough">
      <span css={{ textDecoration: 'line-through' }}>S</span>
    </MarkButton>
  </Fragment>
);
