'use client'

import { createContext, useContext, useMemo } from 'react'
import { Transforms } from 'slate'
import { type RenderElementProps, ReactEditor, useSlateStatic } from 'slate-react'

import { Icon } from '@keystar/ui/icon'
import { columnsIcon } from '@keystar/ui/icon/icons/columnsIcon'
import { trash2Icon } from '@keystar/ui/icon/icons/trash2Icon'

import type { DocumentFeatures } from '../views-shared'
import { isElementActive } from './utils'
import { useToolbarState } from './toolbar-state'

import { insertLayout } from './layouts-shared'
import { blockElementSpacing } from './utils-hooks'
import { BlockPopover, BlockPopoverTrigger } from './primitives/BlockPopover'
import { css, tokenSchema } from '@keystar/ui/style'
import { ActionGroup } from '@keystar/ui/action-group'
import { ActionButton } from '@keystar/ui/button'
import { Flex } from '@keystar/ui/layout'
import { Item } from '@keystar/ui/tag'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'
import { EditorToolbarButton } from '@keystar/ui/editor'

const LayoutOptionsContext = createContext<[number, ...number[]][]>([])

export const LayoutOptionsProvider = LayoutOptionsContext.Provider

// UI Components
export const LayoutContainer = ({
  attributes,
  children,
  element,
}: RenderElementProps & { element: { type: 'layout' } }) => {
  const editor = useSlateStatic()

  const layout = element.layout
  const layoutOptions = useContext(LayoutOptionsContext)
  const currentLayoutIndex = layoutOptions.findIndex(x => x.toString() === layout.toString())

  return (
    <div className={blockElementSpacing} {...attributes}>
      <BlockPopoverTrigger element={element}>
        <div
          className={css({
            columnGap: tokenSchema.size.space.regular,
            display: 'grid',
          })}
          style={{ gridTemplateColumns: layout.map(x => `${x}fr`).join(' ') }}
        >
          {children}
        </div>
        <BlockPopover>
          <Flex padding="regular" gap="regular">
            <ActionGroup
              selectionMode="single"
              prominence="low"
              density="compact"
              onAction={key => {
                const path = ReactEditor.findPath(editor, element)
                const layoutOption = layoutOptions[key as number]
                Transforms.setNodes(editor, { type: 'layout', layout: layoutOption }, { at: path })
                ReactEditor.focus(editor)
              }}
              selectedKeys={currentLayoutIndex !== -1 ? [currentLayoutIndex.toString()] : []}
            >
              {layoutOptions.map((layoutOption, i) => (
                <Item key={i}>{makeLayoutIcon(layoutOption)}</Item>
              ))}
            </ActionGroup>
            <TooltipTrigger>
              <ActionButton
                prominence="low"
                onPress={() => {
                  const path = ReactEditor.findPath(editor, element)
                  Transforms.removeNodes(editor, { at: path })
                }}
              >
                <Icon src={trash2Icon} />
              </ActionButton>
              <Tooltip tone="critical">Remove</Tooltip>
            </TooltipTrigger>
          </Flex>
        </BlockPopover>
      </BlockPopoverTrigger>
    </div>
  )
}

export const LayoutArea = ({ attributes, children }: RenderElementProps) => {
  return (
    <div
      className={css({
        borderColor: tokenSchema.color.border.neutral,
        borderRadius: tokenSchema.size.radius.regular,
        borderStyle: 'dashed',
        borderWidth: tokenSchema.size.border.regular,
        padding: tokenSchema.size.space.medium,
      })}
      {...attributes}
    >
      {children}
    </div>
  )
}

function makeLayoutIcon(ratios: number[]) {
  const size = 16

  const element = (
    <div
      role="img"
      className={css({
        display: 'grid',
        gridTemplateColumns: ratios.map(r => `${r}fr`).join(' '),
        gap: 2,
        width: size,
        height: size,
      })}
    >
      {ratios.map((_, i) => {
        return (
          <div
            key={i}
            className={css({
              backgroundColor: 'currentcolor',
              borderRadius: 1,
            })}
          />
        )
      })}
    </div>
  )

  return element
}

const layoutsIcon = <Icon src={columnsIcon} />

export const LayoutsButton = ({ layouts }: { layouts: DocumentFeatures['layouts'] }) => {
  const {
    editor,
    layouts: { isSelected },
  } = useToolbarState()
  return useMemo(
    () => (
      <TooltipTrigger>
        <EditorToolbarButton
          isSelected={isSelected}
          onPress={() => {
            if (isElementActive(editor, 'layout')) {
              Transforms.unwrapNodes(editor, {
                match: node => node.type === 'layout',
              })
            } else {
              insertLayout(editor, layouts[0])
            }
            ReactEditor.focus(editor)
          }}
        >
          {layoutsIcon}
        </EditorToolbarButton>
        <Tooltip>Layouts</Tooltip>
      </TooltipTrigger>
    ),
    [editor, isSelected, layouts]
  )
}
