/** @jsxRuntime classic */
/** @jsx jsx */
'use client'

import { createContext, useContext, useMemo } from 'react'
import { Transforms } from 'slate'
import {
  type RenderElementProps,
  ReactEditor,
  useFocused,
  useSelected,
  useSlateStatic as useStaticEditor
} from 'slate-react'

import { jsx, useTheme } from '@keystone-ui/core'
import { Tooltip } from '@keystone-ui/tooltip'
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon'
import { ColumnsIcon } from '@keystone-ui/icons/icons/ColumnsIcon'
import { useControlledPopover } from '@keystone-ui/popover'

import { type DocumentFeatures } from '../views-shared'
import { InlineDialog, ToolbarButton, ToolbarGroup, ToolbarSeparator } from './primitives'
import { isElementActive, } from './utils'
import { useToolbarState } from './toolbar-state'

import { insertLayout } from './layouts-shared'

const LayoutOptionsContext = createContext<[number, ...number[]][]>([])

export const LayoutOptionsProvider = LayoutOptionsContext.Provider

// UI Components
export function LayoutContainer ({
  attributes,
  children,
  element,
}: RenderElementProps & { element: { type: 'layout' } }) {
  const { spacing } = useTheme()
  const focused = useFocused()
  const selected = useSelected()
  const editor = useStaticEditor()

  const layout = element.layout
  const layoutOptions = useContext(LayoutOptionsContext)
  const { dialog, trigger } = useControlledPopover(
    { isOpen: focused && selected, onClose: () => {} },
    { modifiers: [{ name: 'offset', options: { offset: [0, 8] } }] }
  )
  return (
    <div
      css={{
        marginBottom: spacing.medium,
        marginTop: spacing.medium,
        position: 'relative',
      }}
      {...attributes}
    >
      <div
        {...trigger.props}
        ref={trigger.ref}
        css={{
          columnGap: spacing.small,
          display: 'grid',
          gridTemplateColumns: layout.map(x => `${x}fr`).join(' '),
        }}
      >
        {children}
      </div>
      {focused && selected && (
        <InlineDialog ref={dialog.ref} {...dialog.props}>
          <ToolbarGroup>
            {layoutOptions.map((layoutOption, i) => (
              <ToolbarButton
                isSelected={layoutOption.toString() === layout.toString()}
                key={i}
                onMouseDown={event => {
                  event.preventDefault()
                  const path = ReactEditor.findPath(editor, element)
                  Transforms.setNodes(
                    editor,
                    {
                      type: 'layout',
                      layout: layoutOption,
                    },
                    { at: path }
                  )
                }}
              >
                {makeLayoutIcon(layoutOption)}
              </ToolbarButton>
            ))}
            <ToolbarSeparator />
            <Tooltip content="Remove" weight="subtle">
              {attrs => (
                <ToolbarButton
                  variant="destructive"
                  onMouseDown={event => {
                    event.preventDefault()
                    const path = ReactEditor.findPath(editor, element)
                    Transforms.removeNodes(editor, { at: path })
                  }}
                  {...attrs}
                >
                  <Trash2Icon size="small" />
                </ToolbarButton>
              )}
            </Tooltip>
          </ToolbarGroup>
        </InlineDialog>
      )}
    </div>
  )
}

export function LayoutArea ({ attributes, children }: RenderElementProps) {
  const { colors, radii, spacing } = useTheme()
  return (
    <div
      css={{
        border: `2px dashed ${colors.border}`,
        borderRadius: radii.small,
        paddingLeft: spacing.medium,
        paddingRight: spacing.medium,
      }}
      {...attributes}
    >
      {children}
    </div>
  )
}

function makeLayoutIcon (ratios: number[]) {
  const size = 16

  const element = (
    <div
      role="img"
      css={{
        display: 'grid',
        gridTemplateColumns: ratios.map(r => `${r}fr`).join(' '),
        gap: 2,
        width: size,
        height: size,
      }}
    >
      {ratios.map((_, i) => {
        return <div key={i} css={{ backgroundColor: 'currentcolor', borderRadius: 1 }} />
      })}
    </div>
  )

  return element
}

const layoutsIcon = <ColumnsIcon size="small" />

export function LayoutsButton ({ layouts }: { layouts: DocumentFeatures['layouts'] }) {
  const {
    editor,
    layouts: { isSelected },
  } = useToolbarState()
  return useMemo(
    () => (
      <Tooltip content="Layouts" weight="subtle">
        {attrs => (
          <ToolbarButton
            isSelected={isSelected}
            onMouseDown={event => {
              event.preventDefault()
              if (isElementActive(editor, 'layout')) {
                Transforms.unwrapNodes(editor, {
                  match: node => node.type === 'layout',
                })
                return
              }
              insertLayout(editor, layouts[0])
            }}
            {...attrs}
          >
            {layoutsIcon}
          </ToolbarButton>
        )}
      </Tooltip>
    ),
    [editor, isSelected, layouts]
  )
}
