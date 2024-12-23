import React, {
  type ComponentProps,
  useState,
  useMemo
} from 'react'
import { Icon } from '@keystar/ui/icon'
import { alignLeftIcon } from '@keystar/ui/icon/icons/alignLeftIcon'
import { alignRightIcon } from '@keystar/ui/icon/icons/alignRightIcon'
import { alignCenterIcon } from '@keystar/ui/icon/icons/alignCenterIcon'
import { chevronDownIcon } from '@keystar/ui/icon/icons/chevronDownIcon'
import { useControlledPopover } from '@keystone-ui/popover'
import { Tooltip } from '@keystone-ui/tooltip'
import { applyRefs } from 'apply-ref'
import { Transforms } from 'slate'

import type { DocumentFeatures } from '../views-shared'
import { InlineDialog, ToolbarButton, ToolbarGroup } from './primitives'
import { useToolbarState } from './toolbar-state'

export function TextAlignMenu ({
  alignment,
}: {
  alignment: DocumentFeatures['formatting']['alignment']
}) {
  const [showMenu, setShowMenu] = useState(false)
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
  )

  return (
    <div
      style={{
        display: 'inline-block',
        position: 'relative',
      }}
    >
      <Tooltip content="Text alignment" weight="subtle">
        {attrs => (
          <TextAlignButton
            attrs={attrs}
            onToggle={() => {
              setShowMenu(x => !x)
            }}
            trigger={trigger}
            showMenu={showMenu}
          />
        )}
      </Tooltip>
      {showMenu ? (
        <InlineDialog ref={dialog.ref} {...dialog.props}>
          <TextAlignDialog
            alignment={alignment}
            onClose={() => {
              setShowMenu(false)
            }}
          />
        </InlineDialog>
      ) : null}
    </div>
  )
}

const ALIGNMENT_ICONS = {
  start: <Icon src={alignLeftIcon} />,
  center: <Icon src={alignCenterIcon} />,
  end: <Icon src={alignRightIcon} />,
}

function TextAlignDialog ({
  alignment,
  onClose,
}: {
  alignment: DocumentFeatures['formatting']['alignment']
  onClose: () => void
}) {
  const {
    alignment: { selected },
    editor,
  } = useToolbarState()
  const alignments = [
    'start',
    ...(Object.keys(alignment) as (keyof typeof alignment)[]).filter(key => alignment[key]),
  ] as const
  return (
    <ToolbarGroup>
      {alignments.map(alignment => (
        <Tooltip key={alignment} content={`Align ${alignment}`} weight="subtle">
          {attrs => (
            <ToolbarButton
              isSelected={selected === alignment}
              onMouseDown={event => {
                event.preventDefault()
                if (alignment === 'start') {
                  Transforms.unsetNodes(editor, 'textAlign', {
                    match: node => node.type === 'paragraph' || node.type === 'heading',
                  })
                } else {
                  Transforms.setNodes(
                    editor,
                    { textAlign: alignment },
                    {
                      match: node => node.type === 'paragraph' || node.type === 'heading',
                    }
                  )
                }
                onClose()
              }}
              {...attrs}
            >
              {ALIGNMENT_ICONS[alignment]}
            </ToolbarButton>
          )}
        </Tooltip>
      ))}
    </ToolbarGroup>
  )
}

function TextAlignButton (props: {
  onToggle: () => void
  trigger: ReturnType<typeof useControlledPopover>['trigger']
  showMenu: boolean
  attrs: Parameters<ComponentProps<typeof Tooltip>['children']>[0]
}) {
  const {
    alignment: { isDisabled, selected },
  } = useToolbarState()
  return useMemo(
    () => (
      <ToolbarButton
        isDisabled={isDisabled}
        isPressed={props.showMenu}
        onMouseDown={event => {
          event.preventDefault()
          props.onToggle()
        }}
        {...props.attrs}
        {...props.trigger.props}
        ref={applyRefs(props.attrs.ref, props.trigger.ref)}
      >
        {ALIGNMENT_ICONS[selected]}
        <Icon src={chevronDownIcon} size="small" />
      </ToolbarButton>
    ),
    [isDisabled, selected, props]
  )
}
