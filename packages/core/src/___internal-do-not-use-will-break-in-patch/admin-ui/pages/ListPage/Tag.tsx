import React, { type ReactNode, useId } from 'react'

import { ActionButton } from '@keystar/ui/button'
import { Icon } from '@keystar/ui/icon'
import { xIcon } from '@keystar/ui/icon/icons/xIcon'
import { SlotProvider } from '@keystar/ui/slots'
import { css, tokenSchema } from '@keystar/ui/style'
import { composeId } from '@keystar/ui/utils'

type TagProps = {
  children: ReactNode
  onRemove?: () => void
}

// TODO: move to @keystar/ui and implement properly
export function Tag (props: TagProps) {
  const { children, onRemove } = props
  const rootId = useId()
  const textId = composeId(rootId, 'label')
  const removeId = composeId(rootId, 'remove')

  return (
    <ActionButton
      aria-labelledby={[textId, removeId].join(' ')}
      onKeyDown={e => {
        if (!onRemove) {
          return
        }

        if (e.key === 'Backspace' || e.key === 'Delete') {
          onRemove()
        }
      }}
      UNSAFE_className={css({
        borderRadius: tokenSchema.size.radius.full,
        height: tokenSchema.size.element.small,
        paddingInlineStart: tokenSchema.size.space.small,
        paddingInlineEnd: 0,
      })}
    >
      <SlotProvider slots={{ text: { id: textId }}}>
        {children}
      </SlotProvider>

      {onRemove && (
        <span
          role="button"
          className={css({
            alignItems: 'center',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            height: tokenSchema.size.element.small,
            width: tokenSchema.size.element.small,

            ':hover': {
              backgroundColor: tokenSchema.color.alias.backgroundHovered,
            },
            ':active': {
              backgroundColor: tokenSchema.color.alias.backgroundPressed,
            },
          })}
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            onRemove()
          }}
        >
          <Icon id={removeId} src={xIcon} aria-label="backspace to remove" />
        </span>
      )}
    </ActionButton>
  )
}
