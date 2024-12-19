import React, {
  useCallback,
  useState,
} from 'react'
import {
  useListFormatter
} from '@react-aria/i18n'
import copyToClipboard from 'clipboard-copy'

import { ActionButton } from '@keystar/ui/button'
import { Icon } from '@keystar/ui/icon'
import { clipboardIcon } from '@keystar/ui/icon/icons/clipboardIcon'
import { Grid, } from '@keystar/ui/layout'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'
import { TextField } from '@keystar/ui/text-field'

import type {
  FieldController,
  FieldControllerConfig,
  FieldProps,
  IdFieldConfig,
} from '../../types'

const COPY_TOOLTIP_CONTENT = {
  neutral: 'Copy ID',
  positive: 'Copied to clipboard',
  critical: 'Unable to copy',
}
type TooltipState = { isOpen?: boolean, tone: keyof typeof COPY_TOOLTIP_CONTENT }

export function Field ({
  field,
  value,
  onChange,
  autoFocus,
  forceValidation,
}: FieldProps<typeof controller>) {
  const [tooltipState, setTooltipState] = useState<TooltipState>({ tone:'neutral' })

  const onCopy = useCallback(async () => {
    try {
      if (value) await copyToClipboard(value)
      setTooltipState({ isOpen: true, tone: 'positive' })
    } catch (err: any) {
      setTooltipState({ isOpen: true, tone: 'critical' })
    }

    // close, then reset the tooltip state after a delay
    setTimeout(() => {
      setTooltipState(state => ({ ...state, isOpen: false }))
    }, 2000)
    setTimeout(() => {
      setTooltipState({ isOpen: undefined, tone: 'neutral' })
    }, 2300)
  }, [value])

  return (
    <Grid gap="regular" columns="1fr auto" alignItems="end">
      <TextField
        label="Item ID"
        value={value ?? ''}
        isReadOnly
        onFocus={({ target }) => {
          if (target instanceof HTMLInputElement) target.select()
        }}
      />
      <TooltipTrigger isOpen={tooltipState.isOpen} placement='top end'>
        <ActionButton aria-label="copy id" onPress={onCopy}>
          <Icon src={clipboardIcon} />
        </ActionButton>
        <Tooltip tone={tooltipState.tone}>
          {COPY_TOOLTIP_CONTENT[tooltipState.tone]}
        </Tooltip>
      </TooltipTrigger>
    </Grid>
  )
}

export function controller (
  config: FieldControllerConfig<IdFieldConfig>
): FieldController<string | null, string> {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: null,
    deserialize: data => data[config.path],
    serialize: value => ({ [config.path]: value }),
    filter: {
      Filter (props) {
        const { autoFocus, context, onChange, type, typeLabel, value, ...otherProps } = props
        const labelProps = context === 'add'
          ? { label: config.label, description: typeLabel }
          : { label: typeLabel }

        return (
          <TextField
            {...otherProps}
            {...labelProps}
            autoFocus={autoFocus}
            onChange={onChange}
            value={value}
          />
        )
      },
      Label ({ label, value, type }) {
        const listFormatter = useListFormatter({
          style: 'short',
          type: 'disjunction',
        })

        if (['in', 'not_in'].includes(type)) {
          return `${label.toLowerCase()} (${listFormatter.format(value.split(','))})`
        }
        return `${label.toLowerCase()} ${value}`
      },
      graphql: ({ type, value }) => {
        if (type === 'not') return { [config.path]: { not: { equals: value } } }
        const valueWithoutWhitespace = value.replace(/\s/g, '')
        const key = type === 'is' ? 'equals' : type === 'not_in' ? 'notIn' : type

        return {
          [config.path]: {
            [key]: ['in', 'not_in'].includes(type)
              ? valueWithoutWhitespace.split(',')
              : valueWithoutWhitespace,
          },
        }
      },
      types: {
        is: { label: 'Is exactly', initialValue: '' },
        not: { label: 'Is not exactly', initialValue: '' },
        gt: { label: 'Is greater than', initialValue: '' },
        lt: { label: 'Is less than', initialValue: '' },
        gte: { label: 'Is greater than or equal to', initialValue: '' },
        lte: { label: 'Is less than or equal to', initialValue: '' },
        in: { label: 'Is one of', initialValue: '' },
        not_in: { label: 'Is not one of', initialValue: '' },
      },
    },
  }
}
