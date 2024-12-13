import { useRouter } from 'next/router'
import React, {
  type FormEvent,
  useId,
  useState
} from 'react'

import { ButtonGroup, Button } from '@keystar/ui/button'
import { Dialog, DialogTrigger } from '@keystar/ui/dialog'
import { Flex } from '@keystar/ui/layout'
import { Content } from '@keystar/ui/slots'
import { Heading, Text } from '@keystar/ui/typography'

import type {
  FieldMeta,
  ListMeta
} from '../../../../types'
import { Tag } from './Tag'
import type { Filter } from './useFilters'

export function FilterList ({ filters, list }: { filters: Filter[], list: ListMeta }) {
  return (
    <Flex gap="small" wrap>
      {filters.map(filter => {
        const field = list.fields[filter.field]
        return <FilterTag key={`${filter.field}_${filter.type}`} field={field} filter={filter} />
      })}
    </Flex>
  )
}

function FilterTag ({ filter, field }: { filter: Filter, field: FieldMeta }) {
  const router = useRouter()
  // doing this because returning a string from Label will be VERY common
  // but https://github.com/microsoft/TypeScript/issues/21699 isn't resolved yet
  const Label = field.controller.filter!.Label as (props: {
    label: string
    type: string
    value: any
  }) => JSX.Element
  const onRemove = () => {
    const { [`!${filter.field}_${filter.type}`]: _ignore, ...queryToKeep } = router.query
    router.push({ pathname: router.pathname, query: queryToKeep })
  }
  const tagElement = (
    <Tag onRemove={onRemove}>
      <Text>
        <span>{field.label} </span>
        <Label
          label={field.controller.filter!.types[filter.type].label}
          type={filter.type}
          value={filter.value}
        />
      </Text>
    </Tag>
  )

  // TODO: Special "empty" types need to be documented somewhere. Filters that
  // have no editable value, basically `null` or `!null`. Which offers:
  // * better DX — we can avoid weird nullable types and UIs that don't make sense
  // * better UX — users don't have to jump through mental hoops, like "is not exactly" + submit empty field
  if (filter.type === 'empty' || filter.type === 'not_empty') return tagElement

  return (
    <DialogTrigger type="popover" mobileType="tray">
      {tagElement}
      {onDismiss => (
        <FilterDialog
          onDismiss={onDismiss}
          field={field}
          filter={filter}
        />
      )}
    </DialogTrigger>
  )
}

function FilterDialog ({
  filter,
  field,
  onDismiss,
}: {
  filter: Filter
  field: FieldMeta
  onDismiss: () => void
}) {
  const formId = useId()
  const router = useRouter()
  const [value, setValue] = useState(filter.value)

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()

    if ((filter.type !== 'empty' && filter.type !== 'not_empty') && value == null) {
      return
    }

    router.push({
      query: {
        ...router.query,
        [`!${filter.field}_${filter.type}`]: JSON.stringify(value),
      },
    })
    onDismiss()
  }

  const Filter = field.controller.filter!.Filter
  const filterTypeLabel = field.controller.filter?.types[filter.type].label

  return (
    <Dialog>
      <Heading>
        {field.label}
      </Heading>
      <Content>
        <form onSubmit={onSubmit} id={formId}>
          <Filter
            autoFocus
            context="edit"
            typeLabel={filterTypeLabel}
            onChange={setValue}
            type={filter.type}
            value={value}
          />
        </form>
      </Content>
      <ButtonGroup>
        <Button onPress={onDismiss}>Cancel</Button>
        <Button type="submit" prominence="high" form={formId}>Save</Button>
      </ButtonGroup>
    </Dialog>
  )
}
