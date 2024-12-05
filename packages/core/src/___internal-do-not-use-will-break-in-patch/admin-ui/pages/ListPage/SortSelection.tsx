/** @jsxRuntime classic */
/** @jsx jsx */

import { useRouter } from 'next/router'
import { Fragment } from 'react'

import { Button } from '@keystone-ui/button'
import { Divider, Heading, jsx, Stack } from '@keystone-ui/core'
import { ChevronDownIcon } from '@keystone-ui/icons/icons/ChevronDownIcon'
import { Options, OptionPrimitive, CheckMark } from '@keystone-ui/options'
import { PopoverDialog, usePopover } from '@keystone-ui/popover'

import { type ListMeta } from '../../../../types'
import { useSort } from './useSort'

const Option: typeof OptionPrimitive = props => {
  return (
    <OptionPrimitive {...props}>
      {props.children}
      <CheckMark
        isDisabled={props.isDisabled}
        isFocused={props.isFocused}
        isSelected={props.isSelected}
      />
    </OptionPrimitive>
  )
}

// TODO: return type required by pnpm :(
export const fieldSelectionOptionsComponents: Parameters<typeof Options>[0]['components'] = {
  Option,
}

export function SortSelection ({
  list,
  orderableFields,
}: {
  list: ListMeta
  orderableFields: Set<string>
}) {
  const sort = useSort(list, orderableFields)
  const { isOpen, setOpen, trigger, dialog, arrow } = usePopover({
    placement: 'bottom',
    modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
  })

  return (
    <Fragment>
      <Button
        {...trigger.props}
        weight="link"
        css={{ padding: 4 }}
        ref={trigger.ref}
        onClick={() => setOpen(!isOpen)}
      >
        <span css={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
          {sort
            ? `${list.fields[sort.field].label} ${
                { ASC: 'ascending', DESC: 'descending' }[sort.direction]
              }`
            : 'No field'}
          <ChevronDownIcon size="smallish" />
        </span>
      </Button>

      <PopoverDialog
        aria-label={`Sort options, list of sorting parameters to apply to the ${list.key} list`}
        arrow={arrow}
        isVisible={isOpen}
        {...dialog.props}
        ref={dialog.ref}
      >
        {isOpen && (
          <SortSelectionPopoverContent
            onClose={() => {
              setOpen(false)
            }}
            list={list}
            orderableFields={orderableFields}
          />
        )}
      </PopoverDialog>
    </Fragment>
  )
}

const noFieldOption = {
  label: 'No field',
  value: '___________NO_FIELD___________',
}

function SortSelectionPopoverContent ({
  onClose,
  list,
  orderableFields,
}: {
  onClose: () => void
  list: ListMeta
  orderableFields: Set<string>
}) {
  const sort = useSort(list, orderableFields)
  const router = useRouter()

  return (
    <Stack padding="medium" css={{ minWidth: 320 }} gap="small">
      <div css={{ position: 'relative' }}>
        <Heading textAlign="center" type="h5">
          Sort
        </Heading>
      </div>
      <Divider />
      <Options
        value={sort ? { label: list.fields[sort.field].label, value: sort.field } : noFieldOption}
        components={fieldSelectionOptionsComponents}
        onChange={newVal => {
          const fieldPath: string = (newVal as any).value
          if (fieldPath === noFieldOption.value) {
            const { sortBy, ...restOfQuery } = router.query

            if (list.initialSort) {
              router.push({
                query: {
                  ...router.query,
                  sortBy: ''
                }
              })
            } else {
              router.push({ query: restOfQuery })
            }
          } else {
            router.push({
              query: {
                ...router.query,
                sortBy:
                  sort?.field === fieldPath && sort.direction === 'ASC'
                    ? `-${sort.field}`
                    : fieldPath,
              },
            })
          }

          onClose()
        }}
        options={[...orderableFields]
          .map(fieldPath => ({ label: list.fields[fieldPath].label, value: fieldPath }))
          .concat(noFieldOption)}
      />
    </Stack>
  )
}
