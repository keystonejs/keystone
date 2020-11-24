/** @jsx jsx */

import { Fragment, ReactNode, forwardRef, useState } from 'react';
import { Editor, Transforms } from 'slate';
import { useSlate } from 'slate-react';
import { applyRefs } from 'apply-ref';

import { jsx, useTheme } from '@keystone-ui/core';
import { useControlledPopover } from '@keystone-ui/popover';
import { Tooltip } from '@keystone-ui/tooltip';

import { AlignLeftIcon } from '@keystone-ui/icons/icons/AlignLeftIcon';
import { AlignRightIcon } from '@keystone-ui/icons/icons/AlignRightIcon';
import { AlignCenterIcon } from '@keystone-ui/icons/icons/AlignCenterIcon';
import { BoldIcon } from '@keystone-ui/icons/icons/BoldIcon';
import { ColumnsIcon } from '@keystone-ui/icons/icons/ColumnsIcon';
import { ItalicIcon } from '@keystone-ui/icons/icons/ItalicIcon';
import { PlusIcon } from '@keystone-ui/icons/icons/PlusIcon';
import { ChevronDownIcon } from '@keystone-ui/icons/icons/ChevronDownIcon';
import { ListIcon } from '@keystone-ui/icons/icons/ListIcon';
import { HashIcon } from '@keystone-ui/icons/icons/HashIcon';
import { Maximize2Icon } from '@keystone-ui/icons/icons/Maximize2Icon';
import { Minimize2Icon } from '@keystone-ui/icons/icons/Minimize2Icon';
import { MinusIcon } from '@keystone-ui/icons/icons/MinusIcon';
import { MessageCircleIcon } from '@keystone-ui/icons/icons/MessageCircleIcon';
import { MoreHorizontalIcon } from '@keystone-ui/icons/icons/MoreHorizontalIcon';

import { Button, ButtonGroup, Separator } from './components';
import { LinkButton } from './link';
import { insertPanel } from './panel';
import { insertQuote } from './quote';
import { BlockComponentsButtons } from './component-blocks';
import { Mark, isMarkActive, onlyContainerNodeInCurrentSelection, toggleMark } from './utils';
import { InlineDialog } from './components/inline-dialog';
import { insertColumns } from './columns';
import { ListButton } from './lists';
import { insertBlockquote } from './blockquote';
import { RelationshipButton } from './relationship';
import { DocumentFeatures } from '../views';

// TODO: how to manage separators with dynamic feature sets...

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
      {!!documentFeatures.headingLevels.length && (
        <Fragment>
          <HeadingMenu headingLevels={documentFeatures.headingLevels} />
          <Separator />
        </Fragment>
      )}
      {Object.values(documentFeatures.inlineMarks).some(x => x) && (
        <Fragment>
          <InlineMarks marks={documentFeatures.inlineMarks} />
          <Separator />
        </Fragment>
      )}
      {(documentFeatures.alignment.center || documentFeatures.alignment.end) && (
        <TextAlignMenu alignment={documentFeatures.alignment} />
      )}
      {documentFeatures.listTypes.unordered && (
        <Tooltip content="Bullet list" weight="subtle">
          {attrs => (
            <ListButton type="unordered-list" {...attrs}>
              <ListIcon size="small" />
            </ListButton>
          )}
        </Tooltip>
      )}
      {documentFeatures.listTypes.ordered && (
        <Tooltip content="Numbered list" weight="subtle">
          {attrs => (
            <ListButton type="ordered-list" {...attrs}>
              <HashIcon size="small" />
            </ListButton>
          )}
        </Tooltip>
      )}
      {documentFeatures.link && (
        <Fragment>
          <Separator />
          <LinkButton />
        </Fragment>
      )}
      {documentFeatures.blockTypes.blockquote && (
        <Tooltip content="Quote" weight="subtle">
          {attrs => (
            <Button
              onMouseDown={event => {
                event.preventDefault();
                insertBlockquote(editor);
              }}
              {...attrs}
            >
              <MessageCircleIcon size="small" />
            </Button>
          )}
        </Tooltip>
      )}
      {!!documentFeatures.columns.length && (
        <Tooltip content="Columns" weight="subtle">
          {attrs => (
            <Button
              onMouseDown={event => {
                event.preventDefault();
                insertColumns(editor, documentFeatures.columns[0]);
              }}
              {...attrs}
            >
              <ColumnsIcon size="small" />
            </Button>
          )}
        </Tooltip>
      )}
      {documentFeatures.dividers && (
        <Tooltip content="Divider" weight="subtle">
          {attrs => (
            <Button
              onMouseDown={event => {
                event.preventDefault();
                Transforms.insertNodes(
                  editor,
                  { type: 'divider', children: [{ text: '' }] },
                  { match: node => node.type === 'paragraph' }
                );
              }}
              {...attrs}
            >
              <MinusIcon size="small" />
            </Button>
          )}
        </Tooltip>
      )}

      <InsertBlockMenu blockTypes={documentFeatures.blockTypes} />

      <Separator />
      <Tooltip content={viewState.expanded ? 'Collapse' : 'Expand'} weight="subtle">
        {attrs => (
          <Button onClick={viewState.toggle} {...attrs}>
            <ExpandIcon size="small" />
          </Button>
        )}
      </Tooltip>
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
        boxShadow: `0 1px ${colors.border}, 0 -1px ${colors.border}`,
        display: 'flex',
        flexWrap: 'wrap',
        paddingBottom: spacing.small,
        paddingTop: spacing.small,
        position: 'sticky',
        top: 0,
        zIndex: 2,
      }}
    >
      {children}
    </div>
  );
};

const HeadingMenu = ({ headingLevels }: { headingLevels: DocumentFeatures['headingLevels'] }) => {
  const [showMenu, setShowMenu] = useState(false);
  const editor = useSlate();
  const { dialog, trigger } = useControlledPopover(
    {
      isOpen: showMenu,
      onClose: () => setShowMenu(false),
    },
    {
      placement: 'bottom-start',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ],
    }
  );

  // prep button label
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
        ref={trigger.ref}
        isPressed={showMenu}
        onClick={event => {
          event.preventDefault();
          setShowMenu(v => !v);
        }}
        style={{ textAlign: 'left', width: 116 }}
        {...trigger.props}
      >
        <span css={{ flex: 1 }}>{buttonLabel}</span>
        <ChevronDownIcon size="small" />
      </Button>
      {showMenu ? (
        <InlineDialog ref={dialog.ref} {...dialog.props}>
          <ButtonGroup direction="column">
            {headingLevels.map(hNum => {
              let [node] = Editor.nodes(editor, {
                match: n => n.type === 'heading' && n.level === hNum,
              });
              let isActive = !!node;
              let Tag = `h${hNum}` as any; // maybe? `keyof JSX.IntrinsicElements`

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
                  <Tag>Heading {hNum}</Tag>
                </Button>
              );
            })}
          </ButtonGroup>
        </InlineDialog>
      ) : null}
    </div>
  );
};

const TextAlignMenu = ({ alignment }: { alignment: DocumentFeatures['alignment'] }) => {
  const [showMenu, setShowMenu] = useState(false);
  const editor = useSlate();
  const { dialog, trigger } = useControlledPopover(
    {
      isOpen: showMenu,
      onClose: () => setShowMenu(false),
    },
    {
      placement: 'bottom-start',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ],
    }
  );

  const [currentParagraph] = Editor.nodes(editor, {
    match: node => node.type === 'paragraph',
  });
  const alignmentAllowed = !!currentParagraph;
  const icons = {
    start: AlignLeftIcon,
    center: AlignCenterIcon,
    end: AlignRightIcon,
  };
  // @ts-ignore
  const currentTextAlign: keyof typeof icons =
    (currentParagraph && currentParagraph[0] && currentParagraph[0].textAlign) || 'start';
  const DisplayIcon = icons[currentTextAlign];

  return (
    <div
      css={{
        display: 'inline-block',
        position: 'relative',
      }}
    >
      <Tooltip content="Text alignment" weight="subtle">
        {({ ref, ...attrs }) => (
          <Button
            ref={applyRefs(ref, trigger.ref)}
            isDisabled={!alignmentAllowed}
            isPressed={showMenu}
            onClick={event => {
              event.preventDefault();
              setShowMenu(v => !v);
            }}
            {...attrs}
            {...trigger.props}
          >
            <DisplayIcon size="small" />
            <ChevronDownIcon size="small" />
          </Button>
        )}
      </Tooltip>
      {showMenu ? (
        <InlineDialog ref={dialog.ref} {...dialog.props}>
          <ButtonGroup>
            <Tooltip content="Align start" weight="subtle">
              {attrs => (
                <Button
                  isSelected={currentTextAlign === 'start'}
                  onMouseDown={event => {
                    event.preventDefault();
                    Transforms.unsetNodes(editor, 'textAlign', {
                      match: node => node.type === 'paragraph',
                    });
                  }}
                  {...attrs}
                >
                  <icons.start size="small" />
                </Button>
              )}
            </Tooltip>
            {alignment.center && (
              <Tooltip content="Align center" weight="subtle">
                {attrs => (
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
                    {...attrs}
                  >
                    <icons.center size="small" />
                  </Button>
                )}
              </Tooltip>
            )}
            {alignment.end && (
              <Tooltip content="Align end" weight="subtle">
                {attrs => (
                  <Button
                    isSelected={currentTextAlign === 'end'}
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
                    {...attrs}
                  >
                    <icons.end size="small" />
                  </Button>
                )}
              </Tooltip>
            )}
          </ButtonGroup>
        </InlineDialog>
      ) : null}
    </div>
  );
};

const InsertBlockMenu = ({ blockTypes }: { blockTypes: DocumentFeatures['blockTypes'] }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { dialog, trigger } = useControlledPopover(
    {
      isOpen: showMenu,
      onClose: () => setShowMenu(false),
    },
    {
      placement: 'bottom-start',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ],
    }
  );
  const editor = useSlate();
  const shouldInsertBlock = onlyContainerNodeInCurrentSelection(editor);

  return (
    <div
      css={{
        display: 'inline-block',
        position: 'relative',
      }}
    >
      <Tooltip content="Insert" weight="subtle">
        {({ ref, ...attrs }) => (
          <Button
            ref={applyRefs(ref, trigger.ref)}
            isPressed={showMenu}
            onMouseDown={event => {
              event.preventDefault();
              setShowMenu(v => !v);
            }}
            {...trigger.props}
            {...attrs}
          >
            <PlusIcon size="small" style={{ strokeWidth: 3 }} />
            <ChevronDownIcon size="small" />
          </Button>
        )}
      </Tooltip>
      {showMenu ? (
        <InlineDialog ref={dialog.ref} {...dialog.props}>
          <ButtonGroup direction="column">
            <BlockComponentsButtons shouldInsertBlock={shouldInsertBlock} />
            {blockTypes.panel && (
              <Button
                isDisabled={!shouldInsertBlock}
                onMouseDown={event => {
                  event.preventDefault();
                  insertPanel(editor);
                  setShowMenu(false);
                }}
              >
                + Panel
              </Button>
            )}
            {blockTypes.quote && (
              <Button
                isDisabled={!shouldInsertBlock}
                onMouseDown={event => {
                  event.preventDefault();
                  insertQuote(editor);
                  setShowMenu(false);
                }}
              >
                + Quote
              </Button>
            )}
            <RelationshipButton />
          </ButtonGroup>
        </InlineDialog>
      ) : null}
    </div>
  );
};

const InlineMarks = ({ marks }: { marks: DocumentFeatures['inlineMarks'] }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { dialog, trigger } = useControlledPopover(
    {
      isOpen: showMenu,
      onClose: () => setShowMenu(false),
    },
    {
      placement: 'bottom-start',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ],
    }
  );
  const hasMenu = marks.strikethrough || marks.underline || marks.code;

  return (
    <Fragment>
      {marks.bold && (
        <Tooltip content="Bold" weight="subtle">
          {attrs => (
            <MarkButton type="bold" {...attrs}>
              <BoldIcon size="small" style={{ strokeWidth: 3 }} />
            </MarkButton>
          )}
        </Tooltip>
      )}
      {marks.italic && (
        <Tooltip content="Italic" weight="subtle">
          {attrs => (
            <MarkButton type="italic" {...attrs}>
              <ItalicIcon size="small" />
            </MarkButton>
          )}
        </Tooltip>
      )}

      {hasMenu && (
        <Fragment>
          <Tooltip content="More formatting" weight="subtle">
            {({ ref, ...attrs }) => (
              <Button
                ref={applyRefs(ref, trigger.ref)}
                isPressed={showMenu}
                onClick={event => {
                  event.preventDefault();
                  setShowMenu(v => !v);
                }}
                {...trigger.props}
                {...attrs}
              >
                <MoreHorizontalIcon size="small" />
              </Button>
            )}
          </Tooltip>
          {showMenu && (
            <InlineDialog ref={dialog.ref} {...dialog.props}>
              <ButtonGroup direction="column">
                {marks.underline && <MarkButton type="underline">Underline</MarkButton>}
                {marks.strikethrough && <MarkButton type="strikethrough">Strikethrough</MarkButton>}
                {marks.code && <MarkButton type="code">Code</MarkButton>}
                {marks.keyboard && <MarkButton type="keyboard">Keyboard</MarkButton>}
                {marks.subscript && <MarkButton type="subscript">Subscript</MarkButton>}
                {marks.superscript && <MarkButton type="superscript">Superscript</MarkButton>}
              </ButtonGroup>
            </InlineDialog>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};
