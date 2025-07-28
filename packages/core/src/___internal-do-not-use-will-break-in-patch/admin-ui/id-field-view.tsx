import { useCallback, useState } from 'react'
import { useListFormatter } from '@react-aria/i18n'
import copyToClipboard from 'clipboard-copy'

import { ActionButton } from '@keystar/ui/button'
import { Icon } from '@keystar/ui/icon'
import { clipboardIcon } from '@keystar/ui/icon/icons/clipboardIcon'
import { Grid } from '@keystar/ui/layout'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'
import { TextField } from '@keystar/ui/text-field'

import type { FieldController, FieldControllerConfig, FieldProps, IdFieldConfig } from '../../types'
import type { InferValueFromInputType } from '@graphql-ts/schema'
import type { filters } from '../../fields/filters'
import { entriesTyped } from '../../lib/core/utils'

const COPY_TOOLTIP_CONTENT = {
  neutral: 'Copy ID',
  positive: 'Copied to clipboard',
  critical: 'Unable to copy',
}
type TooltipState = { isOpen?: boolean; tone: keyof typeof COPY_TOOLTIP_CONTENT }

export function Field({ value }: FieldProps<typeof controller>) {
  const [tooltipState, setTooltipState] = useState<TooltipState>({ tone: 'neutral' })

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
      <TooltipTrigger isOpen={tooltipState.isOpen} placement="top end">
        <ActionButton aria-label="copy id" onPress={onCopy}>
          <Icon src={clipboardIcon} />
        </ActionButton>
        <Tooltip tone={tooltipState.tone}>{COPY_TOOLTIP_CONTENT[tooltipState.tone]}</Tooltip>
      </TooltipTrigger>
    </Grid>
  )
}

export function controller(
  config: FieldControllerConfig<IdFieldConfig>
): FieldController<
  string | null,
  string | string[],
  InferValueFromInputType<(typeof filters)['mysql']['String']['required']>
> {
  return {
    fieldKey: config.fieldKey,
    label: config.label,
    description: config.description,
    defaultValue: null,
    deserialize: data => data[config.fieldKey],
    serialize: value => ({ [config.fieldKey]: value }),
    graphqlSelection: config.fieldKey,
    filter: {
      Filter(props) {
        const { autoFocus, context, onChange, type, typeLabel, value, ...otherProps } = props
        const labelProps =
          context === 'add' ? { label: config.label, description: typeLabel } : { label: typeLabel }
        const [inputValue, setInputValue] = useState(() =>
          Array.isArray(value) ? value.join(', ') : value
        )
        const [lastSeenValue, setLastSeenValue] = useState(value)
        if (value !== lastSeenValue && Array.isArray(value)) {
          setInputValue(value.join(', '))
          setLastSeenValue(value)
        }

        return (
          <TextField
            {...otherProps}
            {...labelProps}
            autoFocus={autoFocus}
            onChange={newVal => {
              if (Array.isArray(value)) {
                setInputValue(newVal)
              } else {
                onChange(newVal)
              }
            }}
            onBlur={() => {
              if (Array.isArray(value)) {
                onChange(inputValue.split(',').map(val => val.trim()))
              }
            }}
            value={Array.isArray(value) ? inputValue : value}
          />
        )
      },

      Label({ label, value, type }) {
        const listFormatter = useListFormatter({
          style: 'short',
          type: 'disjunction',
        })

        if (['in', 'not_in'].includes(type)) {
          return `${label.toLowerCase()} (${listFormatter.format(value)})`
        }
        return `${label.toLowerCase()} ${value}`
      },
      graphql: ({ type, value }) => {
        const valueWithoutWhitespace = Array.isArray(value)
          ? value.map(val => val.replace(/\s/g, ''))
          : value.replace(/\s/g, '')
        if (type === 'not')
          return { [config.fieldKey]: { not: { equals: valueWithoutWhitespace } } }
        const key = type === 'is' ? 'equals' : type === 'not_in' ? 'notIn' : type

        return {
          [config.fieldKey]: {
            [key]: valueWithoutWhitespace,
          },
        }
      },
      parseGraphQL: value => {
        return entriesTyped(value).flatMap(([type, value]) => {
          if (!value) return []
          if (type === 'equals') return { type: 'is', value }
          if (type === 'notIn') return { type: 'not_in', value }
          if (type === 'in') return { type: 'in', value }
          if (type === 'not' && value?.equals) {
            return { type: 'not', value: value?.equals }
          }
          if (type === 'gt' || type === 'gte' || type === 'lt' || type === 'lte') {
            return { type, value }
          }
          return []
        })
      },
      types: {
        is: { label: 'Is exactly', initialValue: '' },
        not: { label: 'Is not exactly', initialValue: '' },
        gt: { label: 'Is greater than', initialValue: '' },
        lt: { label: 'Is less than', initialValue: '' },
        gte: { label: 'Is greater than or equal to', initialValue: '' },
        lte: { label: 'Is less than or equal to', initialValue: '' },
        in: { label: 'Is one of', initialValue: [] },
        not_in: { label: 'Is not one of', initialValue: [] },
      },
    },
  }
}
