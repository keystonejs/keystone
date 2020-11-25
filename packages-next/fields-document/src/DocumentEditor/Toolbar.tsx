/** @jsx jsx */

import { Fragment, ReactNode, forwardRef, useState, HTMLAttributes } from 'react';
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
import { Maximize2Icon } from '@keystone-ui/icons/icons/Maximize2Icon';
import { Minimize2Icon } from '@keystone-ui/icons/icons/Minimize2Icon';
import { MinusIcon } from '@keystone-ui/icons/icons/MinusIcon';
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
import { insertCodeBlock } from './code-block';

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
              <BulletListIcon />
            </ListButton>
          )}
        </Tooltip>
      )}
      {documentFeatures.listTypes.ordered && (
        <Tooltip content="Numbered list" weight="subtle">
          {attrs => (
            <ListButton type="ordered-list" {...attrs}>
              <NumberedListIcon />
            </ListButton>
          )}
        </Tooltip>
      )}
      {(documentFeatures.alignment.center ||
        documentFeatures.alignment.end ||
        documentFeatures.listTypes.unordered ||
        documentFeatures.listTypes.ordered) && <Separator />}

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
      {documentFeatures.link && <LinkButton />}
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
              <QuoteIcon />
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
        paddingBottom: spacing.small,
        paddingTop: spacing.small,
        position: 'sticky',
        top: 0,
        zIndex: 2,
      }}
    >
      <ButtonGroup>{children}</ButtonGroup>
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
            {blockTypes.code && (
              <Button
                isDisabled={!shouldInsertBlock}
                onMouseDown={event => {
                  event.preventDefault();
                  insertCodeBlock(editor);
                  setShowMenu(false);
                }}
              >
                + Code
              </Button>
            )}
            <RelationshipButton />
          </ButtonGroup>
        </InlineDialog>
      ) : null}
    </div>
  );
};

// TODO: Clear formatting
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

// Custom (non-feather) Icons
// ------------------------------

const IconBase = (props: HTMLAttributes<HTMLOrSVGElement>) => (
  <svg
    aria-hidden="true"
    fill="currentColor"
    focusable="false"
    height="16"
    role="presentation"
    viewBox="0 0 16 16"
    width="16"
    {...props}
  />
);

const QuoteIcon = () => (
  <IconBase>
    <path d="M11.3031 2C9.83843 2 8.64879 3.22321 8.64879 4.73171C8.64879 6.23928 9.83843 7.46342 11.3031 7.46342C13.8195 7.46342 12.3613 12.2071 9.18767 12.7012C9.03793 12.7239 8.90127 12.7995 8.80243 12.9143C8.70358 13.029 8.64908 13.1754 8.64879 13.3268C8.64879 13.7147 8.99561 14.0214 9.37973 13.9627C15.148 13.0881 17.1991 2.00093 11.3031 2.00093V2ZM3.65526 2C2.18871 2 1 3.22228 1 4.73171C1 6.23835 2.18871 7.46155 3.65526 7.46155C6.17067 7.46155 4.71252 12.2071 1.53888 12.7012C1.3893 12.7239 1.25277 12.7993 1.15394 12.9139C1.05511 13.0285 1.00051 13.1746 1 13.3259C1 13.7137 1.34682 14.0205 1.73001 13.9617C7.50016 13.0872 9.55128 2 3.65526 2Z" />
  </IconBase>
);
const BulletListIcon = () => (
  <IconBase>
    <path d="M2 4a1 1 0 100-2 1 1 0 000 2zm3.75-1.5a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5zm0 5a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5zm0 5a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5zM3 8a1 1 0 11-2 0 1 1 0 012 0zm-1 6a1 1 0 100-2 1 1 0 000 2z" />
  </IconBase>
);
const NumberedListIcon = () => (
  <IconBase>
    <path d="M2.003 2.5a.5.5 0 00-.723-.447l-1.003.5a.5.5 0 00.446.895l.28-.14V6H.5a.5.5 0 000 1h2.006a.5.5 0 100-1h-.503V2.5zM5 3.25a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5h-8.5A.75.75 0 015 3.25zm0 5a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5h-8.5A.75.75 0 015 8.25zm0 5a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5h-8.5a.75.75 0 01-.75-.75zM.924 10.32l.003-.004a.851.851 0 01.144-.153A.66.66 0 011.5 10c.195 0 .306.068.374.146a.57.57 0 01.128.376c0 .453-.269.682-.8 1.078l-.035.025C.692 11.98 0 12.495 0 13.5a.5.5 0 00.5.5h2.003a.5.5 0 000-1H1.146c.132-.197.351-.372.654-.597l.047-.035c.47-.35 1.156-.858 1.156-1.845 0-.365-.118-.744-.377-1.038-.268-.303-.658-.484-1.126-.484-.48 0-.84.202-1.068.392a1.858 1.858 0 00-.348.384l-.007.011-.002.004-.001.002-.001.001a.5.5 0 00.851.525zM.5 10.055l-.427-.26.427.26z" />
  </IconBase>
);
