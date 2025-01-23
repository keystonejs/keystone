import { breakpointQueries, css, tokenSchema } from '@keystar/ui/style'

import React, {
  type ReactNode,
  useMemo,
  useContext,
} from 'react'
import { Editor, type Element, Transforms } from 'slate'


import { Icon } from '@keystar/ui/icon'
import { boldIcon } from '@keystar/ui/icon/icons/boldIcon'
import { italicIcon } from '@keystar/ui/icon/icons/italicIcon'
import { plusIcon } from '@keystar/ui/icon/icons/plusIcon'
import { chevronDownIcon } from '@keystar/ui/icon/icons/chevronDownIcon'
import { codeIcon } from '@keystar/ui/icon/icons/codeIcon'
import { removeFormattingIcon } from '@keystar/ui/icon/icons/removeFormattingIcon'
import { strikethroughIcon } from '@keystar/ui/icon/icons/strikethroughIcon'
import { subscriptIcon } from '@keystar/ui/icon/icons/subscriptIcon'
import { superscriptIcon } from '@keystar/ui/icon/icons/superscriptIcon'
import { typeIcon } from '@keystar/ui/icon/icons/typeIcon'
import { underlineIcon } from '@keystar/ui/icon/icons/underlineIcon'
import { maximizeIcon } from '@keystar/ui/icon/icons/maximizeIcon'
import { minimizeIcon } from '@keystar/ui/icon/icons/minimizeIcon'
import { Kbd, Text } from '@keystar/ui/typography'

import type { DocumentFeatures } from '../views-shared'
import { linkButton } from './link'
import { ComponentBlockContext, insertComponentBlock } from './component-blocks'
import {
  clearFormatting} from './utils'
import { LayoutsButton } from './layouts'
import { ListButtons } from './lists'
import { blockquoteButton } from './blockquote'
import { DocumentFieldRelationshipsContext } from './relationship'
import { codeButton } from './code-block'
import { TextAlignMenu } from './alignment'
import { dividerButton } from './divider'
import { useToolbarState } from './toolbar-state'
import { Item, Picker } from '@keystar/ui/picker'
import { ReactEditor, useSlateStatic } from 'slate-react'
import { ActionGroup } from '@keystar/ui/action-group'
import { Box, Flex } from '@keystar/ui/layout'
import { ActionButton } from '@keystar/ui/button'
import { MenuTrigger, Menu } from '@keystar/ui/menu'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'

export function Toolbar ({
  documentFeatures,
  viewState,
}: {
  documentFeatures: DocumentFeatures
  viewState?: { expanded: boolean, toggle: () => void }
}) {
  const relationship = useContext(DocumentFieldRelationshipsContext)
  const blockComponent = useContext(ComponentBlockContext)
  const hasBlockItems = Object.entries(relationship).length || Object.keys(blockComponent).length
  const hasMarks = Object.values(documentFeatures.formatting.inlineMarks).some(x => x)

  const hasAlignment =
    documentFeatures.formatting.alignment.center ||
    documentFeatures.formatting.alignment.end
  const hasLists =
    documentFeatures.formatting.listTypes.unordered ||
    documentFeatures.formatting.listTypes.ordered

  return (
    <ToolbarWrapper>
      <ToolbarScrollArea>
        {!!documentFeatures.formatting.headingLevels.length && (
          <HeadingMenu headingLevels={documentFeatures.formatting.headingLevels} />
        )}
        {hasMarks && <InlineMarks marks={documentFeatures.formatting.inlineMarks} />}
        {(hasAlignment || hasLists) && (
          <ToolbarGroup>
            {hasAlignment && (
              <TextAlignMenu
                alignment={documentFeatures.formatting.alignment}
              />
            )}
            {hasLists && (
              <ListButtons lists={documentFeatures.formatting.listTypes} />
            )}
          </ToolbarGroup>
        )}
        <ToolbarGroup>
        {documentFeatures.dividers && dividerButton}
        {documentFeatures.links && linkButton}
        {documentFeatures.formatting.blockTypes.blockquote && blockquoteButton}
        {!!documentFeatures.layouts.length && <LayoutsButton layouts={documentFeatures.layouts} />}
        {documentFeatures.formatting.blockTypes.code && codeButton}</ToolbarGroup>
        {useMemo(() => {
          return (
            viewState && (
              <ToolbarGroup>
                <TooltipTrigger>
                  <ActionButton
                    prominence="low"
                    onPress={() => {
                      viewState.toggle()
                    }}
                  >
                    <Icon
                      src={viewState.expanded ? minimizeIcon : maximizeIcon}
                    />
                  </ActionButton>
                  <Tooltip>{viewState.expanded ? 'Collapse' : 'Expand'}</Tooltip>
                </TooltipTrigger>
              </ToolbarGroup>
            )
          )
        }, [viewState])}
      </ToolbarScrollArea>
  
      {!!hasBlockItems && <InsertBlockMenu />}
    </ToolbarWrapper>
  )
}

const headingMenuVals = new Map<
  string | number,
  'normal' | 1 | 2 | 3 | 4 | 5 | 6
>([
  ['normal', 'normal'],
  ['1', 1],
  ['2', 2],
  ['3', 3],
  ['4', 4],
  ['5', 5],
  ['6', 6],
])

type HeadingItem = { name: string, id: string | number }
const HeadingMenu = ({
  headingLevels,
}: {
  headingLevels: DocumentFeatures['formatting']['headingLevels']
}) => {
  const { editor, textStyles } = useToolbarState()
  const isDisabled = textStyles.allowedHeadingLevels.length === 0
  const items = useMemo(() => {
    let resolvedItems: HeadingItem[] = [{ name: 'Paragraph', id: 'normal' }]
    headingLevels.forEach(level => {
      resolvedItems.push({ name: `Heading ${level}`, id: level.toString() })
    })
    return resolvedItems
  }, [headingLevels])
  const selected = textStyles.selected.toString()

  return useMemo(
    () => (
      <Picker
        flexShrink={0}
        width="scale.1700"
        prominence="low"
        aria-label="Text block"
        items={items}
        isDisabled={isDisabled}
        selectedKey={selected}
        onSelectionChange={selected => {
          let key = headingMenuVals.get(selected)
          if (key === 'normal') {
            Editor.withoutNormalizing(editor, () => {
              Transforms.unsetNodes(editor, 'level', {
                match: n => n.type === 'heading',
              })
              Transforms.setNodes<Element>(
                editor,
                { type: 'paragraph' },
                { match: n => n.type === 'heading' }
              )
            })
          } else if (key) {
            Transforms.setNodes(
              editor,
              { type: 'heading', level: key },
              {
                match: node =>
                  node.type === 'paragraph' || node.type === 'heading',
              }
            )
          }
          ReactEditor.focus(editor)
        }}
      >
        {item => <Item key={item.id}>{item.name}</Item>}
      </Picker>
    ),
    [editor, isDisabled, items, selected]
  )
}

function InsertBlockMenu () {
  const editor = useSlateStatic()
  const componentBlocks = useContext(ComponentBlockContext)

  return (
    <MenuTrigger align="end">
      <TooltipTrigger>
        <ActionButton
          marginY="regular"
          marginEnd="medium"
        >
          <Icon src={plusIcon} />
          <Icon src={chevronDownIcon} />
        </ActionButton>
        <Tooltip>
          <Text>Insert</Text>
          <Kbd>/</Kbd>
        </Tooltip>
      </TooltipTrigger>
      <Menu
        onAction={key => {
          insertComponentBlock(editor, componentBlocks, key as string)
        }}
        items={Object.entries(componentBlocks)}
      >
        {([key, item]) => <Item key={key}>{item.label}</Item>}
      </Menu>
    </MenuTrigger>
  )
}

const inlineMarks = [
  {
    key: 'bold',
    label: 'Bold',
    icon: boldIcon,
    shortcut: `B`,
  },
  {
    key: 'italic',
    label: 'Italic',
    icon: italicIcon,
    shortcut: `I`,
  },
  {
    key: 'underline',
    label: 'Underline',
    icon: underlineIcon,
    shortcut: `U`,
  },
  {
    key: 'strikethrough',
    label: 'Strikethrough',
    icon: strikethroughIcon,
  },
  {
    key: 'code',
    label: 'Code',
    icon: codeIcon,
  },
  {
    key: 'superscript',
    label: 'Superscript',
    icon: superscriptIcon,
  },
  {
    key: 'subscript',
    label: 'Subscript',
    icon: subscriptIcon,
  },
  {
    key: 'clearFormatting',
    label: 'Clear formatting',
    icon: removeFormattingIcon,
  },
] as const

function InlineMarks ({
  marks: _marksShown,
}: {
  marks: DocumentFeatures['formatting']['inlineMarks']
}) {
  const {
    editor,
    clearFormatting: { isDisabled },
    marks,
  } = useToolbarState()
  const marksShown = useMemoStringified(_marksShown)

  const selectedKeys = useMemoStringified(
    Object.keys(marks).filter(
      key => marks[key as keyof typeof marks].isSelected
    )
  )
  const disabledKeys = useMemoStringified(
    Object.keys(marks)
      .filter(key => marks[key as keyof typeof marks].isDisabled)
      .concat(isDisabled ? 'clearFormatting' : [])
  )

  return useMemo(() => {
    const items = inlineMarks.filter(
      item => item.key === 'clearFormatting' || marksShown[item.key]
    )
    return (
      <ActionGroup
        UNSAFE_className={css({
          minWidth: `calc(${tokenSchema.size.element.medium} * 4)`,
        })}
        prominence="low"
        density="compact"
        buttonLabelBehavior="hide"
        overflowMode="collapse"
        summaryIcon={<Icon src={typeIcon} />}
        items={items}
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        disabledKeys={disabledKeys}
        onAction={key => {
          if (key === 'clearFormatting') {
            clearFormatting(editor)
          } else {
            const mark = key as keyof typeof marks
            if (Editor.marks(editor)?.[mark]) {
              Editor.removeMark(editor, mark)
            } else {
              Editor.addMark(editor, mark, true)
            }
          }
          ReactEditor.focus(editor)
        }}
      >
        {item => {
          return (
            <Item key={item.key} textValue={item.label}>
              <Text>{item.label}</Text>
              {'shortcut' in item && <Kbd meta>{item.shortcut}</Kbd>}
              <Icon src={item.icon} />
            </Item>
          )
        }}
      </ActionGroup>
    )
  }, [disabledKeys, editor, marksShown, selectedKeys])
}

function useMemoStringified<T> (value: T): T {
  return useMemo(() => value, [JSON.stringify(value)])
}

function useEntryLayoutSplitPaneContext () {
  return null 
}

/** Group buttons together that don't fit into an `ActionGroup` semantically. */
const ToolbarGroup = ({ children }: { children: ReactNode }) => {
  return <Flex gap="regular">{children}</Flex>
}

const ToolbarContainer = ({ children }: { children: ReactNode }) => {
  let entryLayoutPane = useEntryLayoutSplitPaneContext()
  if (entryLayoutPane === 'main') {
    return (
      <div
        className={css({
          boxSizing: 'border-box',
          display: 'flex',
          paddingInline: tokenSchema.size.space.medium,
          minWidth: 0,
          maxWidth: 800,
          marginInline: 'auto',

          [breakpointQueries.above.mobile]: {
            paddingInline: tokenSchema.size.space.xlarge,
          },
          [breakpointQueries.above.tablet]: {
            paddingInline: tokenSchema.size.space.xxlarge,
          },
        })}
      >
        {children}
      </div>
    )
  }
  return <div className={css({ display: 'flex' })}>{children}</div>
}

const ToolbarWrapper = ({ children }: { children: ReactNode }) => {
  let entryLayoutPane = useEntryLayoutSplitPaneContext()
  return (
    <>
      <div
        data-layout={entryLayoutPane}
        className={css({
          backdropFilter: 'blur(8px)',
          backgroundClip: 'padding-box',
          backgroundColor: `color-mix(in srgb, transparent, ${tokenSchema.color.background.canvas} 90%)`,
          borderBottom: `${tokenSchema.size.border.regular} solid color-mix(in srgb, transparent, ${tokenSchema.color.foreground.neutral} 10%)`,
          borderStartEndRadius: tokenSchema.size.radius.medium,
          borderStartStartRadius: tokenSchema.size.radius.medium,
          minWidth: 0,
          position: 'sticky',
          top: 0,
          zIndex: 2,

          '&[data-layout="main"]': { borderRadius: 0 },
        })}
      >
        <ToolbarContainer>{children}</ToolbarContainer>
      </div>
    </>
  )
}

const ToolbarScrollArea = (props: { children: ReactNode }) => {
  let entryLayoutPane = useEntryLayoutSplitPaneContext()
  return (
    <Flex
      data-layout={entryLayoutPane}
      paddingY="regular"
      paddingX="medium"
      gap="large"
      flex
      minWidth={0}
      UNSAFE_className={css({
        msOverflowStyle: 'none' /* for Internet Explorer, Edge */,
        scrollbarWidth: 'none' /* for Firefox */,
        overflowX: 'auto',

        /* for Chrome, Safari, and Opera */
        '&::-webkit-scrollbar': {
          display: 'none',
        },

        '&[data-layout="main"]': {
          paddingInline: 0,
        },
      })}
      {...props}
    />
  )
}
