import { setBlockType, toggleMark, wrapIn } from 'prosemirror-commands'
import type { MarkType, NodeType } from 'prosemirror-model'
import type { Command, EditorState } from 'prosemirror-state'
import { TextSelection } from 'prosemirror-state'
import { liftTarget } from 'prosemirror-transform'
import type { HTMLAttributes, ReactElement, ReactNode } from 'react'
import { memo, useMemo, useState } from 'react'

import { ActionButton } from '@keystar/ui/button'
import {
  EditorToolbar,
  EditorToolbarButton,
  EditorToolbarGroup,
  EditorToolbarItem,
  EditorToolbarSeparator,
} from '@keystar/ui/editor'
import { Icon } from '@keystar/ui/icon'
import { boldIcon } from '@keystar/ui/icon/icons/boldIcon'
import { chevronDownIcon } from '@keystar/ui/icon/icons/chevronDownIcon'
import { codeIcon } from '@keystar/ui/icon/icons/codeIcon'
import { italicIcon } from '@keystar/ui/icon/icons/italicIcon'
import { listIcon } from '@keystar/ui/icon/icons/listIcon'
import { listOrderedIcon } from '@keystar/ui/icon/icons/listOrderedIcon'
import { minusIcon } from '@keystar/ui/icon/icons/minusIcon'
import { plusIcon } from '@keystar/ui/icon/icons/plusIcon'
import { quoteIcon } from '@keystar/ui/icon/icons/quoteIcon'
import { removeFormattingIcon } from '@keystar/ui/icon/icons/removeFormattingIcon'
import { strikethroughIcon } from '@keystar/ui/icon/icons/strikethroughIcon'
import { tableIcon } from '@keystar/ui/icon/icons/tableIcon'
import { MenuTrigger, Menu } from '@keystar/ui/menu'
import { Picker, Item } from '@keystar/ui/picker'
import { breakpointQueries, css, tokenSchema } from '@keystar/ui/style'
import { Tooltip, TooltipTrigger } from '@keystar/ui/tooltip'
import { Text, Kbd } from '@keystar/ui/typography'

import {
  useEditorDispatchCommand,
  useEditorSchema,
  useEditorState,
  useEditorViewRef,
} from './editor-view'
import { toggleList } from './lists'
import { insertNode, insertTable, toggleCodeBlock } from './commands/misc'
import type { EditorSchema } from './schema'
import { itemRenderer } from './autocomplete/insert-menu'
import { LinkDialog } from './popovers/link-toolbar'
import { DialogContainer } from '@keystar/ui/dialog'
import { linkIcon } from '@keystar/ui/icon/icons/linkIcon'
import { markAround } from './popovers'
import { useEditorKeydownListener } from './keydown'

export function ToolbarButton(props: {
  children: ReactNode
  'aria-label': string
  isSelected?: (editorState: EditorState) => boolean
  isDisabled?: (editorState: EditorState) => boolean
  command: Command
}) {
  const state = useEditorState()
  const runCommand = useEditorDispatchCommand()
  const isSelected = !!props.isSelected?.(state) // no `undefined` — stop "uncontrolled" state taking over
  const isDisabled = !props.command(state) || props.isDisabled?.(state)
  return useMemo(
    () => (
      <EditorToolbarButton
        aria-label={props['aria-label']}
        isSelected={isSelected}
        isDisabled={isDisabled}
        onPress={() => {
          runCommand(props.command)
        }}
      >
        {props.children}
      </EditorToolbarButton>
    ),
    [isDisabled, isSelected, props, runCommand]
  )
}

function LinkButton(props: { link: MarkType }) {
  const [text, setText] = useState<null | string>(null)
  const runCommand = useEditorDispatchCommand()
  const viewRef = useEditorViewRef()
  useEditorKeydownListener(event => {
    if (event.metaKey && (event.key === 'k' || event.key === 'K')) {
      const { state } = viewRef.current!
      if (!isMarkActive(props.link)(state)) {
        event.preventDefault()
        setText(state.doc.textBetween(state.selection.from, state.selection.to))
        return true
      }
    }
    return false
  })
  return useMemo(
    () => (
      <>
        <TooltipTrigger>
          <ToolbarButton
            aria-label="Divider"
            command={(state, dispatch) => {
              const aroundFrom = markAround(state.selection.$from, props.link)
              const aroundTo = markAround(state.selection.$to, props.link)
              if (aroundFrom && (!aroundTo || aroundFrom.mark === aroundTo?.mark)) {
                if (dispatch) {
                  dispatch(
                    state.tr.removeMark(aroundFrom.from, aroundTo?.to ?? aroundFrom.to, props.link)
                  )
                }
                return true
              }
              if (state.selection.empty) {
                return false
              }
              if (dispatch) {
                const text = state.doc.textBetween(state.selection.from, state.selection.to)
                setText(text)
              }
              return true
            }}
            isSelected={isMarkActive(props.link)}
          >
            <Icon src={linkIcon} />
          </ToolbarButton>
          <Tooltip>
            <Text>Link</Text>
            <Kbd meta>K</Kbd>
          </Tooltip>
        </TooltipTrigger>
        <DialogContainer
          onDismiss={() => {
            setText(null)
          }}
        >
          {text && (
            <LinkDialog
              href=""
              text={text}
              onSubmit={attrs => {
                setText(null)
                runCommand(toggleMark(props.link, attrs))
              }}
            />
          )}
        </DialogContainer>
      </>
    ),
    [props.link, runCommand, text]
  )
}

export const Toolbar = memo(function Toolbar(props: HTMLAttributes<HTMLDivElement>) {
  const schema = useEditorSchema()
  const { nodes, marks } = schema
  return (
    <ToolbarWrapper {...props}>
      <ToolbarScrollArea>
        {nodes.heading && <HeadingMenu headingType={nodes.heading} />}
        <EditorToolbar aria-label="Formatting options">
          <EditorToolbarSeparator />
          <InlineMarks />
          <EditorToolbarSeparator />
          <ListButtons />
          <EditorToolbarSeparator />
          <EditorToolbarGroup aria-label="Blocks">
            {nodes.divider && (
              <TooltipTrigger>
                <ToolbarButton
                  aria-label="Divider"
                  command={insertNode(nodes.divider)}
                  isSelected={typeInSelection(nodes.divider)}
                >
                  <Icon src={minusIcon} />
                </ToolbarButton>
                <Tooltip>
                  <Text>Divider</Text>
                  <Kbd>---</Kbd>
                </Tooltip>
              </TooltipTrigger>
            )}
            {marks.link && <LinkButton link={marks.link} />}
            {nodes.blockquote && (
              <TooltipTrigger>
                <ToolbarButton
                  aria-label="Quote"
                  command={(state, dispatch) => {
                    const hasQuote = typeInSelection(nodes.blockquote!)(state)
                    if (hasQuote) {
                      const { $from, $to } = state.selection
                      const range = $from.blockRange($to, node => node.type === nodes.blockquote)
                      if (!range) return false
                      const target = liftTarget(range)
                      if (target === null) return false
                      if (dispatch) {
                        dispatch(state.tr.lift(range, target).scrollIntoView())
                      }
                      return true
                    } else {
                      return wrapIn(nodes.blockquote!)(state, dispatch)
                    }
                  }}
                  isSelected={typeInSelection(nodes.blockquote)}
                >
                  <Icon src={quoteIcon} />
                </ToolbarButton>
                <Tooltip>
                  <Text>Quote</Text>
                  <Kbd>{'>⎵'}</Kbd>
                </Tooltip>
              </TooltipTrigger>
            )}
            {nodes.code_block && (
              <TooltipTrigger>
                <ToolbarButton
                  aria-label="Code block"
                  command={toggleCodeBlock(nodes.code_block, nodes.paragraph)}
                  isSelected={typeInSelection(nodes.code_block)}
                >
                  <Icon src={codeIcon} />
                </ToolbarButton>
                <Tooltip>
                  <Text>Code block</Text>
                  <Kbd>```</Kbd>
                </Tooltip>
              </TooltipTrigger>
            )}
            {nodes.table && (
              <TooltipTrigger>
                <ToolbarButton aria-label="Table" command={insertTable(nodes.table)}>
                  <Icon src={tableIcon} />
                </ToolbarButton>
                <Tooltip>
                  <Text>Table</Text>
                </Tooltip>
              </TooltipTrigger>
            )}
          </EditorToolbarGroup>
        </EditorToolbar>
      </ToolbarScrollArea>

      <InsertBlockMenu />
    </ToolbarWrapper>
  )
})

const ToolbarContainer = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className={css({
        alignItems: 'center',
        boxSizing: 'border-box',
        display: 'flex',
        height: tokenSchema.size.element.medium,

        [breakpointQueries.above.mobile]: {
          height: tokenSchema.size.element.large,
        },
      })}
    >
      {children}
    </div>
  )
}

const ToolbarWrapper = (props: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      {...props}
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
      })}
    >
      <ToolbarContainer>{props.children}</ToolbarContainer>
    </div>
  )
}

const ToolbarScrollArea = (props: { children: ReactNode }) => {
  return (
    <div
      className={css({
        alignItems: 'center',
        display: 'flex',
        flex: 1,
        gap: tokenSchema.size.space.regular,
        paddingInline: tokenSchema.size.space.medium,
        minWidth: 0,
        overflowX: 'auto',

        // avoid cropping focus rings
        marginBlock: `calc(${tokenSchema.size.alias.focusRing} * -1)`,
        paddingBlock: tokenSchema.size.alias.focusRing,

        // hide scrollbars
        msOverflowStyle: 'none', // for Internet Explorer, Edge
        scrollbarWidth: 'none', // for Firefox
        '&::-webkit-scrollbar': { display: 'none' }, // for Chrome, Safari, and Opera
      })}
      {...props}
    />
  )
}
type HeadingState = 'normal' | 1 | 2 | 3 | 4 | 5 | 6
const headingMenuVals = new Map<string | number, HeadingState>([
  ['normal', 'normal'],
  ['1', 1],
  ['2', 2],
  ['3', 3],
  ['4', 4],
  ['5', 5],
  ['6', 6],
])

type HeadingItem = { name: string; id: string | number }

function getHeadingMenuState(
  state: EditorState,
  headingType: NodeType,
  paragraphType: NodeType
): HeadingState | 'disabled' {
  let activeLevel: HeadingState | 'disabled' | undefined
  for (const range of state.selection.ranges) {
    state.doc.nodesBetween(range.$from.pos, range.$to.pos, node => {
      if (node.type === headingType) {
        const level = node.attrs.level
        if (activeLevel === undefined) {
          activeLevel = level
        } else if (activeLevel !== level) {
          activeLevel = 'disabled'
        }
      }
      if (node.type === paragraphType) {
        if (activeLevel === undefined) {
          activeLevel = 'normal'
        } else if (activeLevel !== 'normal') {
          activeLevel = 'disabled'
        }
      }
    })
    if (activeLevel === 'disabled') {
      break
    }
  }
  return activeLevel ?? 'disabled'
}

const HeadingMenu = (props: { headingType: NodeType }) => {
  const { nodes, config } = useEditorSchema()
  const items = useMemo(() => {
    let resolvedItems: HeadingItem[] = [{ name: 'Paragraph', id: 'normal' }]
    config.heading.levels.forEach(level => {
      resolvedItems.push({ name: `Heading ${level}`, id: level.toString() })
    })
    return resolvedItems
  }, [config.heading.levels])
  const state = useEditorState()
  const menuState = getHeadingMenuState(state, props.headingType, nodes.paragraph)
  const runCommand = useEditorDispatchCommand()

  return useMemo(
    () => (
      <Picker
        flexShrink={0}
        width="scale.1700"
        prominence="low"
        aria-label="Text block"
        items={items}
        isDisabled={menuState === 'disabled'}
        selectedKey={menuState === 'disabled' ? 'normal' : menuState.toString()}
        onSelectionChange={selected => {
          if (selected === null) return
          let key = headingMenuVals.get(selected)
          if (key === 'normal') {
            runCommand(setBlockType(nodes.paragraph))
          } else if (key) {
            runCommand(
              setBlockType(props.headingType, {
                level: parseInt(key as any),
              })
            )
          }
        }}
      >
        {item => <Item key={item.id}>{item.name}</Item>}
      </Picker>
    ),
    [items, menuState, nodes.paragraph, props.headingType, runCommand]
  )
}

function InsertBlockMenu() {
  const commandDispatch = useEditorDispatchCommand()
  const schema = useEditorSchema()

  const items = useMemo(
    () => schema.insertMenuItems.filter(x => x.forToolbar),
    [schema.insertMenuItems]
  )
  const idToItem = useMemo(() => new Map(items.map(item => [item.id, item])), [items])

  if (items.length === 0) {
    return null
  }

  return (
    <MenuTrigger align="end">
      <TooltipTrigger>
        <ActionButton marginEnd={'medium'}>
          <Icon src={plusIcon} />
          <Icon src={chevronDownIcon} />
        </ActionButton>
        <Tooltip>
          <Text>Insert</Text>
          <Kbd>/</Kbd>
        </Tooltip>
      </TooltipTrigger>
      <Menu
        onAction={id => {
          const command = idToItem.get(id as string)?.command
          if (command) {
            commandDispatch(command)
          }
        }}
        items={items}
      >
        {itemRenderer}
      </Menu>
    </MenuTrigger>
  )
}

const isMarkActive = (markType: MarkType) => (state: EditorState) => {
  if (state.selection instanceof TextSelection && state.selection.empty) {
    if (!state.selection.$cursor) return false
    return !!markType.isInSet(state.storedMarks || state.selection.$cursor.marks())
  }
  for (const range of state.selection.ranges) {
    if (state.doc.rangeHasMark(range.$from.pos, range.$to.pos, markType)) {
      return true
    }
  }
  return false
}

function InlineMarks() {
  const state = useEditorState()
  const schema = useEditorSchema()
  const runCommand = useEditorDispatchCommand()
  const inlineMarks = useMemo(() => {
    const marks: {
      key: string
      label: string
      icon: ReactElement
      shortcut?: string
      command: Command
      isSelected: (state: EditorState) => boolean
    }[] = []
    if (schema.marks.bold) {
      marks.push({
        key: 'bold',
        label: 'Bold',
        icon: boldIcon,
        shortcut: `B`,
        command: toggleMark(schema.marks.bold),
        isSelected: isMarkActive(schema.marks.bold),
      })
    }

    if (schema.marks.italic) {
      marks.push({
        key: 'italic',
        label: 'Italic',
        icon: italicIcon,
        shortcut: `I`,
        command: toggleMark(schema.marks.italic),
        isSelected: isMarkActive(schema.marks.italic),
      })
    }
    if (schema.marks.strikethrough) {
      marks.push({
        key: 'strikethrough',
        label: 'Strikethrough',
        icon: strikethroughIcon,
        command: toggleMark(schema.marks.strikethrough),
        isSelected: isMarkActive(schema.marks.strikethrough),
      })
    }
    if (schema.marks.code) {
      marks.push({
        key: 'code',
        label: 'Code',
        icon: codeIcon,
        command: toggleMark(schema.marks.code),
        isSelected: isMarkActive(schema.marks.code),
      })
    }

    for (const [name, componentConfig] of Object.entries(schema.components)) {
      if (componentConfig.kind !== 'mark') continue
      marks.push({
        key: name,
        label: componentConfig.label,
        icon: componentConfig.icon,
        command: toggleMark(schema.schema.marks[name]),
        isSelected: isMarkActive(schema.schema.marks[name]),
      })
    }

    marks.push({
      key: 'clearFormatting',
      label: 'Clear formatting',
      icon: removeFormattingIcon,
      command: removeAllMarks(),
      isSelected: () => false,
    })
    return marks
  }, [schema])
  const selectedKeys = useMemoStringified(
    inlineMarks.filter(val => val.isSelected(state)).map(val => val.key)
  )
  const disabledKeys = useMemoStringified(
    inlineMarks.filter(val => !val.command(state)).map(val => val.key)
  )

  return useMemo(() => {
    return (
      <EditorToolbarGroup
        aria-label="Text formatting"
        value={selectedKeys}
        onChange={key => {
          const mark = inlineMarks.find(mark => mark.key === key)
          if (mark) {
            runCommand(mark.command)
          }
        }}
        disabledKeys={disabledKeys}
        selectionMode="multiple"
      >
        {inlineMarks.map(mark => (
          <TooltipTrigger key={mark.key}>
            <EditorToolbarItem value={mark.key} aria-label={mark.label}>
              <Icon src={mark.icon} />
            </EditorToolbarItem>
            <Tooltip>
              <Text>{mark.label}</Text>
              {'shortcut' in mark && <Kbd meta>{mark.shortcut}</Kbd>}
            </Tooltip>
          </TooltipTrigger>
        ))}
      </EditorToolbarGroup>
    )
  }, [disabledKeys, inlineMarks, runCommand, selectedKeys])
}

function useMemoStringified<T>(value: T): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => value, [JSON.stringify(value)])
}

function getActiveListType(state: EditorState, schema: EditorSchema) {
  const sharedDepth = state.selection.$from.sharedDepth(state.selection.to)
  for (let i = sharedDepth; i > 0; i--) {
    const node = state.selection.$from.node(i)
    if (node.type === schema.nodes.ordered_list) {
      return 'ordered_list' as const
    } else if (node.type === schema.nodes.unordered_list) {
      return 'unordered_list' as const
    }
  }
  return null
}

function ListButtons() {
  const state = useEditorState()
  const schema = useEditorSchema()
  const dispatchCommand = useEditorDispatchCommand()

  const canWrapInOrderedList =
    !!schema.nodes.ordered_list && toggleList(schema.nodes.ordered_list)(state)
  const canWrapInUnorderedList =
    !!schema.nodes.unordered_list && toggleList(schema.nodes.unordered_list)(state)
  const activeListType = getActiveListType(state, schema)

  const items = useMemo(() => {
    return [
      !!schema.nodes.unordered_list && {
        label: 'Bullet list',
        key: 'unordered_list',
        shortcut: '-',
        icon: listIcon,
      },
      !!schema.nodes.ordered_list && {
        label: 'Numbered list',
        key: 'ordered_list',
        shortcut: '1.',
        icon: listOrderedIcon,
      },
    ].filter(removeFalse)
  }, [schema.nodes.unordered_list, schema.nodes.ordered_list])

  const disabledKeys = useMemo(() => {
    return [
      !canWrapInOrderedList && 'ordered_list',
      !canWrapInUnorderedList && 'unordered_list',
    ].filter(removeFalse)
  }, [canWrapInOrderedList, canWrapInUnorderedList])

  return useMemo(() => {
    if (items.length === 0) {
      return null
    }

    return (
      <EditorToolbarGroup
        aria-label="Lists"
        value={activeListType}
        onChange={key => {
          const format = key as 'ordered_list' | 'unordered_list'
          const type = schema.nodes[format]
          if (type) {
            dispatchCommand(toggleList(type))
          }
        }}
        disabledKeys={disabledKeys}
        selectionMode="single"
      >
        {items.map(item => (
          <TooltipTrigger key={item.key}>
            <EditorToolbarItem value={item.key} aria-label={item.label}>
              <Icon src={item.icon} />
            </EditorToolbarItem>
            <Tooltip>
              <Text>{item.label}</Text>
              <Kbd>{item.shortcut}</Kbd>
            </Tooltip>
          </TooltipTrigger>
        ))}
      </EditorToolbarGroup>
    )
  }, [activeListType, disabledKeys, dispatchCommand, items, schema.nodes])
}

function removeFalse<T>(val: T): val is Exclude<T, false> {
  return val !== false
}

function removeAllMarks(): Command {
  return (state, dispatch) => {
    if (state.selection.empty) {
      return false
    }

    if (dispatch) {
      dispatch(state.tr.removeMark(state.selection.from, state.selection.to))
    }
    return true
  }
}

function typeInSelection(type: NodeType) {
  return (state: EditorState) => {
    let hasBlock = false
    for (const range of state.selection.ranges) {
      state.doc.nodesBetween(range.$from.pos, range.$to.pos, node => {
        if (node.type === type) {
          hasBlock = true
        }
      })
      if (hasBlock) break
    }
    return hasBlock
  }
}
