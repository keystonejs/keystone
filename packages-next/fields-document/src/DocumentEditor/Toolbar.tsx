/** @jsx jsx */

import { forwardRef, Fragment, ReactNode, useState } from 'react';
import { Editor, Transforms } from 'slate';
import { useSlate } from 'slate-react';

import { jsx, useTheme } from '@keystone-ui/core';

import { AlignLeftIcon } from '@keystone-ui/icons/icons/AlignLeftIcon';
import { AlignRightIcon } from '@keystone-ui/icons/icons/AlignRightIcon';
import { AlignCenterIcon } from '@keystone-ui/icons/icons/AlignCenterIcon';
import { BoldIcon } from '@keystone-ui/icons/icons/BoldIcon';
import { ColumnsIcon } from '@keystone-ui/icons/icons/ColumnsIcon';
import { ItalicIcon } from '@keystone-ui/icons/icons/ItalicIcon';
import { PlusIcon } from '@keystone-ui/icons/icons/PlusIcon';
import { ChevronDownIcon } from '@keystone-ui/icons/icons/ChevronDownIcon';
import { UnderlineIcon } from '@keystone-ui/icons/icons/UnderlineIcon';
import { Maximize2Icon } from '@keystone-ui/icons/icons/Maximize2Icon';
import { Minimize2Icon } from '@keystone-ui/icons/icons/Minimize2Icon';
import { MessageCircleIcon } from '@keystone-ui/icons/icons/MessageCircleIcon';

import { Button, Separator } from './components';
import { LinkButton } from './link';
import { insertPanel } from './panel';
import { insertQuote } from './quote';
import { BlockComponentsButtons } from './component-blocks';
import { Mark, isMarkActive, onlyContainerNodeInCurrentSelection, toggleMark } from './utils';
import { Hoverable } from './components/hoverable';
import { insertColumns } from './columns';
import { ListButton } from './lists';
import { insertBlockquote } from './blockquote';
import { RelationshipButton } from './relationship';
import { DocumentFeatures } from '../views';
import { useControlledPopover } from '@keystone-ui/popover';

// TODO use icons for toolbar buttons, make it sticky, etc
export const Toolbar = ({
  documentFeatures,
  viewState,
}: {
  documentFeatures: DocumentFeatures;
  viewState: { expanded: boolean; toggle: () => void };
}) => {
  const ExpandIcon = viewState.expanded ? Minimize2Icon : Maximize2Icon;
  const editor = useSlate();

  return (
    <ToolbarContainer>
      <HeadingMenu />
      <Separator />
      <InlineMarkings />
      <Separator />
      <TextAlignMenu />
      <ListButton type="unordered-list">• List</ListButton>
      <ListButton type="ordered-list"># List</ListButton>
      <Separator />
      <LinkButton />
      <Button
        onMouseDown={event => {
          event.preventDefault();
          insertBlockquote(editor);
        }}
      >
        <MessageCircleIcon size="small" />
      </Button>
      <Button
        onMouseDown={event => {
          event.preventDefault();
          insertColumns(editor);
        }}
      >
        <ColumnsIcon size="small" />
      </Button>
      <InsertBlockMenu />
      <Button onClick={viewState.toggle} css={{ justifySelf: 'flex-end' }}>
        <ExpandIcon size="small" />
      </Button>
    </ToolbarContainer>
  );
};

/* UI Components */

const MarkButton = forwardRef<any, { children: ReactNode; type: Mark }>(
  ({ type, ...props }, ref) => {
    const editor = useSlate();
    return (
      <Button
        ref={ref}
        isSelected={isMarkActive(editor, type)}
        onMouseDown={event => {
          event.preventDefault();
          toggleMark(editor, type);
        }}
        {...props}
      />
    );
  }
);

const ToolbarContainer = ({ children }: { children: ReactNode }) => {
  const { colors, spacing } = useTheme();

  return (
    <div
      css={{
        backgroundColor: colors.background,
        borderBottom: `1px solid ${colors.border}`,
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        flexWrap: 'wrap',
        paddingBottom: spacing.medium,
        paddingTop: spacing.medium,
        position: 'sticky',
        top: -1,
        zIndex: 2,
      }}
    >
      {children}
    </div>
  );
};

const HeadingMenu = () => {
  const [showMenu, setShowMenu] = useState(false);
  const editor = useSlate();
  let [headingNodes] = Editor.nodes(editor, {
    match: n => n.type === 'heading',
  });
  let buttonLabel = 'Normal text';

  if (headingNodes) {
    buttonLabel = 'Heading ' + headingNodes[0].level;
  }

  return (
    <div
      css={{
        display: 'inline-block',
        position: 'relative',
      }}
    >
      <Button
        style={{ width: 110 }}
        onMouseDown={event => {
          event.preventDefault();
          setShowMenu(v => !v);
        }}
      >
        {buttonLabel}
        <ChevronDownIcon size="small" />
      </Button>
      {showMenu ? (
        <Hoverable direction="column" placement="left" onClickOutside={() => setShowMenu(false)}>
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

                  setShowMenu(false);
                }}
              >
                Heading {hNum}
              </Button>
            );
          })}
        </Hoverable>
      ) : null}
    </div>
  );
};

const TextAlignMenu = () => {
  const [showMenu, setShowMenu] = useState(false);
  const editor = useSlate();

  const [currentParagraph] = Editor.nodes(editor, {
    match: node => node.type === 'paragraph',
  });
  const alignmentAllowed = !!currentParagraph;
  const icons = {
    left: AlignLeftIcon,
    center: AlignCenterIcon,
    right: AlignRightIcon,
  };
  // @ts-ignore
  const currentTextAlign: keyof typeof icons =
    (currentParagraph && currentParagraph[0] && currentParagraph[0].textAlign) || 'left';
  const DisplayIcon = icons[currentTextAlign];

  return (
    <div
      css={{
        display: 'inline-block',
        position: 'relative',
      }}
    >
      <Button
        isDisabled={!alignmentAllowed}
        onMouseDown={event => {
          event.preventDefault();
          setShowMenu(v => !v);
        }}
      >
        <DisplayIcon size="small" />
        <ChevronDownIcon size="small" />
      </Button>
      {showMenu ? (
        <Hoverable placement="left" onClickOutside={() => setShowMenu(false)}>
          <Button
            isSelected={currentTextAlign === 'left'}
            onMouseDown={event => {
              event.preventDefault();
              Transforms.unsetNodes(editor, 'textAlign', {
                match: node => node.type === 'paragraph',
              });
            }}
          >
            <icons.left size="small" />
          </Button>
          <Button
            isSelected={currentTextAlign === 'center'}
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
            <icons.center size="small" />
          </Button>
          <Button
            isSelected={currentTextAlign === 'right'}
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
            <icons.right size="small" />
          </Button>
        </Hoverable>
      ) : null}
    </div>
  );
};

const InsertBlockMenu = () => {
  const [showMenu, setShowMenu] = useState(false);
  const editor = useSlate();
  const shouldInsertBlock = onlyContainerNodeInCurrentSelection(editor);

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
          setShowMenu(v => !v);
        }}
      >
        <PlusIcon size="small" style={{ strokeWidth: 3 }} />
        <ChevronDownIcon size="small" />
      </Button>
      {showMenu ? (
        <Hoverable placement="left" direction="column" onClickOutside={() => setShowMenu(false)}>
          <BlockComponentsButtons shouldInsertBlock={shouldInsertBlock} />
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
            isDisabled={!shouldInsertBlock}
            onMouseDown={event => {
              event.preventDefault();
              insertQuote(editor);
            }}
          >
            + Quote
          </Button>
          <RelationshipButton />
        </Hoverable>
      ) : null}
    </div>
  );
};

const InlineMarkings = () => (
  <Fragment>
    <MarkButton type="bold">
      <BoldIcon size="small" style={{ strokeWidth: 3 }} />
    </MarkButton>
    <MarkButton type="italic">
      <ItalicIcon size="small" />
    </MarkButton>
    <MarkButton type="underline">
      <UnderlineIcon size="small" />
    </MarkButton>
    {/*
      Are these useful?
      ------------------------------
      <MarkButton type="strikethrough">
        <span style={{ textDecoration: 'line-through' }}>S</span>
      </MarkButton>
    */}
  </Fragment>
);
