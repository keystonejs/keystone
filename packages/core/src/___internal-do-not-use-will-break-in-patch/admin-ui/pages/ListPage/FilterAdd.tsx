import { useRouter } from 'next/router'
import React, {
  type FormEvent,
  Fragment,
  useId,
  useMemo,
  useRef,
  useState
} from 'react'

import { ActionButton, ButtonGroup, Button } from '@keystar/ui/button'
import { Dialog, DialogTrigger } from '@keystar/ui/dialog'
import { Icon } from '@keystar/ui/icon'
import { chevronDownIcon } from '@keystar/ui/icon/icons/chevronDownIcon'
import { Grid } from '@keystar/ui/layout'
import { MenuTrigger, Menu, Item } from '@keystar/ui/menu'
import { Picker } from '@keystar/ui/picker'
import { Content } from '@keystar/ui/slots'
import { Heading, Text } from '@keystar/ui/typography'

import type {
  FieldMeta,
  JSONValue
} from '../../../../types'
import { useList } from '../../../../admin-ui/context'

type State =
  | { kind: 'selecting-field' }
  | { kind: 'filter-value', fieldPath: string, filterType: string, filterValue: JSONValue }

export function FilterAdd ({
  listKey,
  isDisabled
}: {
  listKey: string
  isDisabled?: boolean
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const [state, setState] = useState<State>({ kind: 'selecting-field' })
  const [forceValidation, setForceValidation] = useState(false)
  const router = useRouter()
  const formId = useId()

  const {
    fieldsWithFilters,
    filtersByFieldThenType,
    list,
  } = useFilterFields(listKey)
  const resetState = () => {
    setState({ kind: 'selecting-field' })
    setForceValidation(false)
    // This is a bit of a hack to ensure the trigger button is focused after the
    // dialog closes, since we're forking the render
    setTimeout(() => {
      triggerRef?.current?.focus()
    }, 200)
  }
  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setForceValidation(true)

    if (state.kind !== 'filter-value') return
    if ((state.filterType !== 'empty' && state.filterType !== 'not_empty') && state.filterValue == null) {
      return
    }

    router.push({
      query: {
        ...router.query,
        [`!${state.fieldPath}_${state.filterType}`]: JSON.stringify(state.filterValue),
      },
    })
    resetState()
  }

  if (state.kind === 'filter-value') {
    const { Filter } = fieldsWithFilters[state.fieldPath].controller.filter
    const fieldLabel = list.fields[state.fieldPath].label
    const filterTypes = filtersByFieldThenType[state.fieldPath]
    const typeLabel = filterTypes[state.filterType]
    return (
      <DialogTrigger type="popover" mobileType="tray" defaultOpen onOpenChange={isOpen => !isOpen && resetState()}>
        <ActionButton>
          <Text>Filter</Text>
          <Icon src={chevronDownIcon} />
        </ActionButton>
        <Dialog>
          <Heading>
            Filter by {fieldLabel.toLocaleLowerCase()}
          </Heading>
          <Content>
            <form onSubmit={onSubmit} id={formId}>
              {/*
                Workaround for react-aria "bug" where pressing enter in a form field
                moves focus to the submit button.
                See: https://github.com/adobe/react-spectrum/issues/5940
              */}
              <button type="submit" form={formId} style={{ display: 'none' }} />
              <Grid gap="large" rows="auto minmax(0, 1fr)" height="100%">
                <Picker
                  width="100%"
                  aria-label="filter type"
                  isRequired
                  items={Object.keys(filterTypes).map(filterType => ({
                    label: filterTypes[filterType],
                    value: filterType,
                  }))}
                  selectedKey={state.filterType}
                  onSelectionChange={key => {
                    if (key) {
                      setState({
                        kind: 'filter-value',
                        fieldPath: state.fieldPath,
                        filterValue:
                          fieldsWithFilters[state.fieldPath].controller.filter.types[key]
                            .initialValue,
                        filterType: key as string,
                      })
                    }
                  }}
                >
                  {item => <Item key={item.value}>{item.label}</Item>}
                </Picker>

                {/*
                  TODO: support validation, default to field controller's validate function?
                  validate?: (value: JSONValue) => string | undefined
                */}
                <Filter
                  autoFocus
                  context="add"
                  forceValidation={forceValidation}
                  typeLabel={typeLabel}
                  type={state.filterType}
                  value={state.filterValue}
                  onChange={value => {
                    setState(state => ({
                      ...state,
                      filterValue: value,
                    }))
                  }}
                />
              </Grid>
            </form>
          </Content>
          <ButtonGroup>
            <Button onPress={resetState}>Cancel</Button>
            <Button prominence="high" type="submit" form={formId}>
              Save
            </Button>
          </ButtonGroup>
        </Dialog>
      </DialogTrigger>
    )
  }

  return (
    <Fragment>
      <MenuTrigger>
        <ActionButton ref={triggerRef} isDisabled={isDisabled}>
          <Text>Filter</Text>
          <Icon src={chevronDownIcon} />
        </ActionButton>
        <Menu
          items={Object.keys(filtersByFieldThenType).map(fieldPath => ({
            label: fieldsWithFilters[fieldPath].label,
            value: fieldPath,
          }))}
          onAction={fieldPath => {
            const filterType = Object.keys(filtersByFieldThenType[fieldPath])[0]
            setState({
              kind: 'filter-value',
              fieldPath: fieldPath as string,
              filterType,
              filterValue:
                fieldsWithFilters[fieldPath].controller.filter.types[filterType].initialValue,
            })
          }}
        >
          {item => (
            <Item key={item.value} >{item.label}</Item>
          )}
        </Menu>
      </MenuTrigger>
    </Fragment>
  )
}

function useFilterFields (listKey: string) {
  const list = useList(listKey)
  const router = useRouter()
  const fieldsWithFilters = useMemo(() => {
    const fieldsWithFilters: Record<
      string,
      FieldMeta & { controller: { filter: NonNullable<FieldMeta['controller']['filter']> } }
    > = {}
    for (const fieldPath in list.fields) {
      const field = list.fields[fieldPath]
      if (field.isFilterable && field.controller.filter) {
        fieldsWithFilters[fieldPath] = field as any
      }
    }
    return fieldsWithFilters
  }, [list.fields])

  const filtersByFieldThenType = useMemo(() => {
    const filtersByFieldThenType: Record<string, Record<string, string>> = {}
    for (const fieldPath in fieldsWithFilters) {
      const field = fieldsWithFilters[fieldPath]
      let hasUnusedFilters = false
      const filters: Record<string, string> = {}
      for (const filterType in field.controller.filter.types) {
        if (router.query[`!${fieldPath}_${filterType}`] === undefined) {
          hasUnusedFilters = true
          filters[filterType] = field.controller.filter.types[filterType].label
        }
      }
      if (hasUnusedFilters) {
        filtersByFieldThenType[fieldPath] = filters
      }
    }
    return filtersByFieldThenType
  }, [router.query, fieldsWithFilters])

  return {
    fieldsWithFilters,
    filtersByFieldThenType,
    list,
  }
}
