import { ActionButton } from '@keystar/ui/button'
import { Icon } from '@keystar/ui/icon'
import { chevronDownIcon } from '@keystar/ui/icon/icons/chevronDownIcon'
import { MenuTrigger, Menu } from '@keystar/ui/menu'
import { css, tokenSchema } from '@keystar/ui/style'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'
import { Item } from '@react-stately/collections'
import type { Command, EditorState } from 'prosemirror-state'
import { Plugin } from 'prosemirror-state'
import { addColumnAfter, addRowAfter, deleteColumn, deleteRow } from 'prosemirror-tables'
import { useEditorDispatchCommand, useEditorState } from '../editor-view'
import { Decoration, DecorationSet } from 'prosemirror-view'
import type { ResolvedPos } from 'prosemirror-model'
import { createPortal } from 'react-dom'

const cellActions: Record<string, { label: string; command: Command }> = {
  deleteRow: { label: 'Delete row', command: deleteRow },
  deleteColumn: { label: 'Delete column', command: deleteColumn },
  insertRowBelow: { label: 'Insert row below', command: addRowAfter },
  insertColumnRight: { label: 'Insert column right', command: addColumnAfter },
}

function CellMenu() {
  const runCommand = useEditorDispatchCommand()
  const gutter = tokenSchema.size.space.small
  return (
    <div
      contentEditable={false}
      className={css({
        top: gutter,
        insetInlineEnd: gutter,
        position: 'absolute',
      })}
    >
      <TooltipTrigger>
        <MenuTrigger align="end">
          <ActionButton
            prominence="low"
            aria-label="Cell options"
            UNSAFE_className={css({
              borderRadius: tokenSchema.size.radius.small,
              height: 'auto',
              minWidth: 0,
              padding: 0,

              // tiny buttons; increase the hit area
              '&::before': {
                content: '""',
                inset: `calc(${gutter} * -1)`,
                position: 'absolute',
              },
            })}
          >
            <Icon src={chevronDownIcon} />
          </ActionButton>
          <Menu
            onAction={key => {
              if (key in cellActions) {
                runCommand(cellActions[key].command)
              }
            }}
            items={Object.entries(cellActions).map(([key, item]) => ({
              ...item,
              key,
            }))}
          >
            {item => <Item key={item.key}>{item.label}</Item>}
          </Menu>
        </MenuTrigger>
        <Tooltip>Options</Tooltip>
      </TooltipTrigger>
    </div>
  )
}

function getDecoration(state: EditorState) {
  const cellPos = findCellPosAbove(state.selection.$from)
  if (cellPos !== undefined) {
    const element = document.createElement('div')
    const decoration = Decoration.widget(cellPos + 1, element, {
      element,
      side: 1,
    })
    return { set: DecorationSet.create(state.doc, [decoration]), element }
  }
}

const _tableCellMenuPlugin: Plugin<{ set: DecorationSet; element: HTMLDivElement } | undefined> =
  new Plugin({
    state: {
      init(config, state) {
        return getDecoration(state)
      },
      apply(tr, oldPluginState, oldState, state) {
        return getDecoration(state)
      },
    },
    props: {
      decorations(state) {
        return _tableCellMenuPlugin.getState(state)?.set
      },
    },
  })
export function tableCellMenuPlugin() {
  return _tableCellMenuPlugin
}

export function CellMenuPortal() {
  const state = useEditorState()
  const element = _tableCellMenuPlugin.getState(state)?.element
  if (!element) return null
  return createPortal(<CellMenu />, element)
}

function findCellPosAbove($pos: ResolvedPos) {
  for (let d = $pos.depth; d > 0; d--) {
    const node = $pos.node(d)
    const role = node.type.spec.tableRole
    if (role === 'cell' || role === 'header_cell') {
      return $pos.before(d)
    }
  }
}
