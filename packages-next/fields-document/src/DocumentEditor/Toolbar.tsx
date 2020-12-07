/** @jsx jsx */

import { Fragment, ReactNode, forwardRef, useState, memo, HTMLAttributes, useMemo } from 'react';
import { Editor, Transforms } from 'slate';
import { useSlate } from 'slate-react';
import { applyRefs } from 'apply-ref';

import { jsx, useTheme } from '@keystone-ui/core';
import { useControlledPopover } from '@keystone-ui/popover';
import { Tooltip } from '@keystone-ui/tooltip';

import { BoldIcon } from '@keystone-ui/icons/icons/BoldIcon';
import { ItalicIcon } from '@keystone-ui/icons/icons/ItalicIcon';
import { PlusIcon } from '@keystone-ui/icons/icons/PlusIcon';
import { ChevronDownIcon } from '@keystone-ui/icons/icons/ChevronDownIcon';
import { Maximize2Icon } from '@keystone-ui/icons/icons/Maximize2Icon';
import { Minimize2Icon } from '@keystone-ui/icons/icons/Minimize2Icon';
import { MoreHorizontalIcon } from '@keystone-ui/icons/icons/MoreHorizontalIcon';

import { InlineDialog, ToolbarButton, ToolbarGroup, ToolbarSeparator } from './primitives';
import { linkButton } from './link';
import { BlockComponentsButtons } from './component-blocks';
import { Mark, isMarkActive, onlyContainerNodeInCurrentSelection, toggleMark } from './utils';
import { ColumnsButton } from './columns';
import { ListButton } from './lists';
import { blockquoteButton } from './blockquote';
import { RelationshipButton } from './relationship';
import { DocumentFeatures } from '../views';
import { insertCodeBlock } from './code-block';
import { TextAlignMenu } from './alignment';
import { dividerButton } from './divider';

// TODO: how to manage separators with dynamic feature sets...

const unorderedListButton = (
  <Tooltip content="Bullet list" weight="subtle">
    {attrs => (
      <ListButton type="unordered-list" {...attrs}>
        <BulletListIcon />
      </ListButton>
    )}
  </Tooltip>
);

const orderedListButton = (
  <Tooltip content="Numbered list" weight="subtle">
    {attrs => (
      <ListButton type="ordered-list" {...attrs}>
        <NumberedListIcon />
      </ListButton>
    )}
  </Tooltip>
);

export const Toolbar = memo(function Toolbar({
  documentFeatures,
  viewState,
}: {
  documentFeatures: DocumentFeatures;
  viewState: { expanded: boolean; toggle: () => void };
}) {
  const ExpandIcon = viewState.expanded ? Minimize2Icon : Maximize2Icon;

  return (
    <ToolbarContainer>
      {!!documentFeatures.headingLevels.length && (
        <Fragment>
          <HeadingMenu headingLevels={documentFeatures.headingLevels} />
          <ToolbarSeparator />
        </Fragment>
      )}
      {Object.values(documentFeatures.inlineMarks).some(x => x) && (
        <Fragment>
          <InlineMarks marks={documentFeatures.inlineMarks} />
          <ToolbarSeparator />
        </Fragment>
      )}
      {(documentFeatures.alignment.center || documentFeatures.alignment.end) && (
        <TextAlignMenu alignment={documentFeatures.alignment} />
      )}
      {documentFeatures.listTypes.unordered && unorderedListButton}
      {documentFeatures.listTypes.ordered && orderedListButton}
      {(documentFeatures.alignment.center ||
        documentFeatures.alignment.end ||
        documentFeatures.listTypes.unordered ||
        documentFeatures.listTypes.ordered) && <ToolbarSeparator />}

      {documentFeatures.dividers && dividerButton}
      {documentFeatures.link && linkButton}
      {documentFeatures.blockTypes.blockquote && blockquoteButton}
      {!!documentFeatures.columns.length && <ColumnsButton columns={documentFeatures.columns} />}

      <InsertBlockMenu blockTypes={documentFeatures.blockTypes} />

      <ToolbarSeparator />
      {useMemo(
        () => (
          <Tooltip content={viewState.expanded ? 'Collapse' : 'Expand'} weight="subtle">
            {attrs => (
              <ToolbarButton onClick={viewState.toggle} {...attrs}>
                <ExpandIcon size="small" />
              </ToolbarButton>
            )}
          </Tooltip>
        ),
        [viewState]
      )}
    </ToolbarContainer>
  );
});

/* UI Components */

const MarkButton = forwardRef<any, { children: ReactNode; type: Mark }>(
  ({ type, ...props }, ref) => {
    const editor = useSlate();
    return (
      <ToolbarButton
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
      <ToolbarGroup>{children}</ToolbarGroup>
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
      <ToolbarButton
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
      </ToolbarButton>
      {showMenu ? (
        <InlineDialog ref={dialog.ref} {...dialog.props}>
          <ToolbarGroup direction="column">
            {headingLevels.map(hNum => {
              let [node] = Editor.nodes(editor, {
                match: n => n.type === 'heading' && n.level === hNum,
              });
              let isActive = !!node;
              let Tag = `h${hNum}` as any; // maybe? `keyof JSX.IntrinsicElements`

              return (
                <ToolbarButton
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
                </ToolbarButton>
              );
            })}
          </ToolbarGroup>
        </InlineDialog>
      ) : null}
    </div>
  );
};

const InsertBlockMenu = memo(function InsertBlockMenu({
  blockTypes,
}: {
  blockTypes: DocumentFeatures['blockTypes'];
}) {
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

  return (
    <div
      css={{
        display: 'inline-block',
        position: 'relative',
      }}
    >
      <Tooltip content="Insert" weight="subtle">
        {({ ref, ...attrs }) => (
          <ToolbarButton
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
          </ToolbarButton>
        )}
      </Tooltip>
      {showMenu ? (
        <InlineDialog ref={dialog.ref} {...dialog.props}>
          <InnerInsertBlockMenu blockTypes={blockTypes} onClose={() => setShowMenu(false)} />
        </InlineDialog>
      ) : null}
    </div>
  );
});

function InnerInsertBlockMenu({
  blockTypes,
  onClose,
}: {
  blockTypes: DocumentFeatures['blockTypes'];
  onClose: () => void;
}) {
  const editor = useSlate();
  const shouldInsertBlock = onlyContainerNodeInCurrentSelection(editor);

  return (
    <ToolbarGroup direction="column">
      {blockTypes.code && (
        <ToolbarButton
          isDisabled={!shouldInsertBlock}
          onMouseDown={event => {
            event.preventDefault();
            insertCodeBlock(editor);
            onClose();
          }}
        >
          Code block
        </ToolbarButton>
      )}
      <RelationshipButton />
      <BlockComponentsButtons onClose={onClose} shouldInsertBlock={shouldInsertBlock} />
    </ToolbarGroup>
  );
}

// TODO: Clear formatting
const InlineMarks = memo(function InlineMarks({
  marks,
}: {
  marks: DocumentFeatures['inlineMarks'];
}) {
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
              <ToolbarButton
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
              </ToolbarButton>
            )}
          </Tooltip>
          {showMenu && (
            <InlineDialog ref={dialog.ref} {...dialog.props}>
              <ToolbarGroup direction="column">
                {marks.underline && <MarkButton type="underline">Underline</MarkButton>}
                {marks.strikethrough && <MarkButton type="strikethrough">Strikethrough</MarkButton>}
                {marks.code && <MarkButton type="code">Code</MarkButton>}
                {marks.keyboard && <MarkButton type="keyboard">Keyboard</MarkButton>}
                {marks.subscript && <MarkButton type="subscript">Subscript</MarkButton>}
                {marks.superscript && <MarkButton type="superscript">Superscript</MarkButton>}
              </ToolbarGroup>
            </InlineDialog>
          )}
        </Fragment>
      )}
    </Fragment>
  );
});

// Custom (non-feather) Icons
// ------------------------------

export const IconBase = (props: HTMLAttributes<HTMLOrSVGElement>) => (
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
