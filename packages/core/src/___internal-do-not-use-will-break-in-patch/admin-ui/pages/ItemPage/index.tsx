import React, {
  type PropsWithChildren,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import copyToClipboard from 'clipboard-copy'
import { useRouter } from 'next/router'

import { ActionButton, Button } from '@keystar/ui/button'
import { Icon } from '@keystar/ui/icon'
import { fileWarningIcon } from '@keystar/ui/icon/icons/fileWarningIcon'
import { clipboardIcon } from '@keystar/ui/icon/icons/clipboardIcon'
import { AlertDialog, DialogContainer, DialogTrigger } from '@keystar/ui/dialog'
import { Box, Grid, VStack } from '@keystar/ui/layout'
import { Notice } from '@keystar/ui/notice'
import { ProgressCircle } from '@keystar/ui/progress'
import { SlotProvider } from '@keystar/ui/slots'
import { TextField } from '@keystar/ui/text-field'
import { toastQueue } from '@keystar/ui/toast'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'
import { Heading, Text } from '@keystar/ui/typography'

import type { ListMeta, FieldMeta } from '../../../../types'
import {
  type DataGetter,
  type DeepNullable,
  type ItemData,
  Fields,
  deserializeValue,
  makeDataGetter,
  useChangedFieldsAndDataForUpdate,
  useInvalidFields,
} from '../../../../admin-ui/utils'
import { gql, useMutation, useQuery } from '../../../../admin-ui/apollo'
import { useList } from '../../../../admin-ui/context'
import { PageContainer } from '../../../../admin-ui/components/PageContainer'
import { GraphQLErrorNotice } from '../../../../admin-ui/components/GraphQLErrorNotice'
import { usePreventNavigation } from '../../../../admin-ui/utils/usePreventNavigation'
import { CreateButtonLink } from '../../../../admin-ui/components/CreateButtonLink'
import { ErrorDetailsDialog } from '../../../../admin-ui/components/Errors'
import { BaseToolbar, ColumnLayout, ItemPageHeader, StickySidebar } from './common'

type ItemPageProps = {
  listKey: string
}

function useEventCallback<Func extends (...args: any) => any>(callback: Func): Func {
  const callbackRef = useRef(callback)
  const cb = useCallback((...args: any[]) => {
    return callbackRef.current(...args)
  }, [])
  useEffect(() => {
    callbackRef.current = callback
  })
  return cb as any
}

type ItemViewFieldModes = NonNullable<FieldMeta['itemView']['fieldMode']>
type ItemViewFieldPositions = NonNullable<FieldMeta['itemView']['fieldPosition']>

function ItemForm ({
  listKey,
  itemGetter,
  selectedFields,
  fieldModes,
  fieldPositions,
  showDelete,
  item,
}: {
  listKey: string
  itemGetter: DataGetter<ItemData>
  selectedFields: string
  fieldModes: Record<string, ItemViewFieldModes>
  fieldPositions: Record<string, ItemViewFieldPositions>
  showDelete: boolean
  item: ItemData
}) {
  const list = useList(listKey)
  const [errorDialogValue, setErrorDialogValue] = useState<Error | null>(null)
  const [update, { loading, error, data }] = useMutation(
    gql`mutation ($data: ${list.graphql.names.updateInputName}!, $id: ID!) {
      item: ${list.graphql.names.updateMutationName}(where: { id: $id }, data: $data) {
        ${selectedFields}
      }
    }`,
    { errorPolicy: 'all' }
  )

  itemGetter =
    useMemo(() => {
      if (data) return makeDataGetter(data, error?.graphQLErrors).get('item')
    }, [data, error]) ?? itemGetter

  const [state, setValue] = useState(() => {
    const value = deserializeValue(list.fields, itemGetter)
    return { value, item: itemGetter }
  })
  if (
    !loading &&
    state.item.data !== itemGetter.data &&
    (itemGetter.errors || []).every(x => x.path?.length !== 1)
  ) {
    const value = deserializeValue(list.fields, itemGetter)
    setValue({ value, item: itemGetter })
  }

  const { changedFields, dataForUpdate } = useChangedFieldsAndDataForUpdate(
    list.fields,
    state.item,
    state.value
  )

  const invalidFields = useInvalidFields(list.fields, state.value)
  const [forceValidation, setForceValidation] = useState(false)
  const onSave = useEventCallback(async (e) => {
    e.preventDefault()
    const newForceValidation = invalidFields.size !== 0
    setForceValidation(newForceValidation)
    if (newForceValidation) return

    const { errors } = await update({
      variables: {
        data: dataForUpdate,
        id: state.item.get('id').data
      }
    })

    const error = errors?.find(x => x.path === undefined || x.path?.length === 1)
    if (error) {
      return toastQueue.critical('Unable to save item', {
        actionLabel: 'Details',
        onAction: () => setErrorDialogValue(new Error(error.message)),
        shouldCloseOnAction: true,
      })
    }

    toastQueue.positive(`Saved changes to ${list.singular.toLocaleLowerCase()}`, {
      timeout: 5000,
    })
  })

  const labelFieldValue = list.isSingleton ? list.label : state.item.data?.[list.labelField]
  const itemId = state.item.data?.id
  const hasChangedFields = !!changedFields.size
  usePreventNavigation(useMemo(() => ({ current: hasChangedFields }), [hasChangedFields]))

  return (
    <Fragment>
      <form onSubmit={onSave} style={{ display: 'contents' }}>
        {/*
          Workaround for react-aria "bug" where pressing enter in a form field
          moves focus to the submit button.
          See: https://github.com/adobe/react-spectrum/issues/5940
        */}
        <button type="submit" style={{ display: 'none' }} />
        <VStack gap="large" gridArea="main" marginTop="xlarge" minWidth={0}>
          <GraphQLErrorNotice
            // we're checking for path.length === 1 because errors with a path larger than 1 will be field level errors
            // which are handled seperately and do not indicate a failure to update the item
            errors={[
              error?.networkError?.message,
              ...error?.graphQLErrors.filter(x => x.path?.length === 1).map(x => x.message) ?? []
            ]}
          />
          <Fields
            groups={list.groups}
            fieldModes={fieldModes}
            fields={list.fields}
            forceValidation={forceValidation}
            invalidFields={invalidFields}
            position="form"
            fieldPositions={fieldPositions}
            onChange={useCallback(value => {
              setValue(state => ({ item: state.item, value: value(state.value) }))
            }, [setValue])}
            value={state.value}
          />
        </VStack>

        <StickySidebar>
          <IdField itemId={itemId} />

          <Box marginTop="xlarge">
            <Fields
              groups={list.groups}
              fieldModes={fieldModes}
              fields={list.fields}
              forceValidation={forceValidation}
              invalidFields={invalidFields}
              position="sidebar"
              fieldPositions={fieldPositions}
              onChange={useCallback(
                value => {
                  setValue(state => ({ item: state.item, value: value(state.value) }))
                },
                [setValue]
              )}
              value={state.value}
            />
          </Box>
        </StickySidebar>

        <BaseToolbar>
          <Button
            isDisabled={!hasChangedFields}
            isPending={loading}
            prominence="high"
            type="submit"
          >
            Save
          </Button>
          <ResetButton
            hasChanges={hasChangedFields}
            onReset={useEventCallback(() => {
              setValue(state => ({
                item: state.item,
                value: deserializeValue(list.fields, state.item),
              }))
            })}
          />
          <Box flex />
          {useMemo(() =>
            showDelete ? (
              <DeleteButton
                list={list}
                itemLabel={labelFieldValue ?? itemId}
                itemId={itemId}
              />
            ) : undefined,
          [showDelete, list, labelFieldValue, itemId])}
        </BaseToolbar>
      </form>

      <DialogContainer onDismiss={() => setErrorDialogValue(null)} isDismissable>
        {errorDialogValue && <ErrorDetailsDialog error={errorDialogValue} />}
      </DialogContainer>
    </Fragment>
  )
}

const COPY_TOOLTIP_CONTENT = {
  neutral: 'Copy ID',
  positive: 'Copied to clipboard',
  critical: 'Unable to copy',
}
type TooltipState = { isOpen?: boolean, tone: keyof typeof COPY_TOOLTIP_CONTENT }
function IdField ({ itemId }: { itemId: string }) {
  const [tooltipState, setTooltipState] = useState<TooltipState>({ tone:'neutral' })

  const onCopy = useCallback(async () => {
    try {
      await copyToClipboard(itemId)
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
  }, [itemId])

  return (
    <Grid gap="regular" columns="1fr auto" alignItems="end">
      <TextField
        label="Item ID"
        value={itemId}
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

function DeleteButton ({
  itemLabel,
  itemId,
  list,
}: {
  itemLabel: string
  itemId: string
  list: ListMeta
}) {
  const [errorDialogValue, setErrorDialogValue] = useState<Error | null>(null)
  const router = useRouter()
  const [deleteItem] = useMutation(
    gql`mutation ($id: ID!) {
      ${list.graphql.names.deleteMutationName}(where: { id: $id }) {
        id
      }
    }`,
    { variables: { id: itemId } }
  )

  return (
    <Fragment>
      <DialogTrigger>
        <Button tone="critical">
          Delete
        </Button>
        <AlertDialog
          tone="critical"
          title="Delete item"
          cancelLabel="Cancel"
          primaryActionLabel="Yes, delete"
          onPrimaryAction={async () => {
            try {
              await deleteItem()
            } catch (err: any) {
              toastQueue.critical('Unable to delete item.', {
                actionLabel: 'Details',
                onAction: () => {
                  setErrorDialogValue(err)
                },
                shouldCloseOnAction: true,
              })
              return
            }

            toastQueue.neutral(`${list.singular} deleted.`, {
              timeout: 5000,
            })
            router.push(list.isSingleton ? '/' : `/${list.path}`)
          }}
        >
          <Text>
            Are you sure you want to delete <strong>“{itemLabel}”</strong>?
            This action cannot be undone.
          </Text>
        </AlertDialog>
      </DialogTrigger>

      <DialogContainer onDismiss={() => setErrorDialogValue(null)} isDismissable>
        {errorDialogValue && <ErrorDetailsDialog error={errorDialogValue} />}
      </DialogContainer>
    </Fragment>
  )
}

export const getItemPage = (props: ItemPageProps) => () => <ItemPage {...props} />

function ItemPage ({ listKey }: ItemPageProps) {
  const list = useList(listKey)
  const id_ = useRouter().query.id
  const [id] = Array.isArray(id_) ? id_ : [id_]

  const { query, selectedFields } = useMemo(() => {
    const selectedFields = Object.entries(list.fields)
      .filter(([fieldKey, field]) => {
        if (fieldKey === 'id') return true
        return field.itemView.fieldMode !== 'hidden'
      })
      .map(([fieldKey]) => {
        return list.fields[fieldKey].controller.graphqlSelection
      })
      .join('\n')

    return {
      selectedFields,
      query: gql`
        query ItemPage($id: ID!, $listKey: String!) {
          item: ${list.graphql.names.itemQueryName}(where: {id: $id}) {
            ${selectedFields}
          }
          keystone {
            adminMeta {
              list(key: $listKey) {
                hideCreate
                hideDelete
                fields {
                  path
                  itemView(id: $id) {
                    fieldMode
                    fieldPosition
                  }
                }
              }
            }
          }
        }
      `,
    }
  }, [list])

  const { data, error, loading } = useQuery(query, {
    variables: { id, listKey },
    errorPolicy: 'all',
    skip: id === undefined,
  })

  const dataGetter = makeDataGetter<
    DeepNullable<{
      item: ItemData
      keystone: {
        adminMeta: {
          list: {
            fields: {
              path: string
              itemView: {
                fieldMode: ItemViewFieldModes
                fieldPosition: ItemViewFieldPositions
              }
            }[]
          }
        }
      }
    }>
  >(data, error?.graphQLErrors)

  const itemViewFieldModesByField = useMemo(() => {
    const itemViewFieldModesByField: Record<string, ItemViewFieldModes> = {}
    dataGetter.data?.keystone?.adminMeta?.list?.fields?.forEach(field => {
      if (field === null || field.path === null || field?.itemView?.fieldMode == null) return
      itemViewFieldModesByField[field.path] = field.itemView.fieldMode
    })
    return itemViewFieldModesByField
  }, [dataGetter.data?.keystone?.adminMeta?.list?.fields])

  const itemViewFieldPositionsByField = useMemo(() => {
    const itemViewFieldPositionsByField: Record<string, ItemViewFieldPositions> = {}
    dataGetter.data?.keystone?.adminMeta?.list?.fields?.forEach(field => {
      if (field === null || field.path === null || field?.itemView?.fieldPosition == null) return
      itemViewFieldPositionsByField[field.path] = field.itemView.fieldPosition
    })
    return itemViewFieldPositionsByField
  }, [dataGetter.data?.keystone?.adminMeta?.list?.fields])

  const pageLoading = loading || id === undefined
  const metaQueryErrors = dataGetter.get('keystone').errors
  const pageLabel = (data && data.item && (data.item[list.labelField] || data.item.id)) || id
  const pageTitle: string = list.isSingleton ? list.label : pageLoading ? undefined : pageLabel

  return (
    <PageContainer
      title={pageTitle}
      header={
        <ItemPageHeader
          list={list}
          label={pageLoading ? 'Loading...' : pageLabel}
          title={pageTitle}
        />
      }
    >
      {pageLoading ? (
        <VStack height="100%" alignItems="center" justifyContent="center">
          <ProgressCircle aria-label="loading item data" size="large" isIndeterminate  />
        </VStack>
      ) : metaQueryErrors ? (
        <Box marginY="xlarge">
          <Notice tone="critical">{metaQueryErrors[0].message}</Notice>
        </Box>
      ) : (
        <ColumnLayout>
          {data?.item == null ? (
            <Box marginY="xlarge">
              <GraphQLErrorNotice
                errors={[
                  error?.networkError,
                  ...error?.graphQLErrors ?? []
                ]}
              />
              {list.isSingleton ? (
                id === '1' ? (
                  <ItemNotFound>
                    <Text>“{list.label}” doesn’t exist, or you don’t have access to it.</Text>
                    {!data.keystone.adminMeta.list!.hideCreate && <CreateButtonLink list={list} />}
                  </ItemNotFound>
                ) : (
                  <ItemNotFound>
                    <Text>An item with ID <strong>“{id}”</strong> does not exist.</Text>
                  </ItemNotFound>
                )
              ) : (
                <ItemNotFound>
                  <Text>The item with ID <strong>“{id}”</strong> doesn’t exist, or you don’t have access to it.</Text>
                </ItemNotFound>
              )}
            </Box>
          ) : (
            <ItemForm
              fieldModes={itemViewFieldModesByField}
              fieldPositions={itemViewFieldPositionsByField}
              selectedFields={selectedFields}
              showDelete={!data.keystone.adminMeta.list!.hideDelete}
              listKey={listKey}
              itemGetter={dataGetter.get('item') as DataGetter<ItemData>}
              item={data.item}
            />
          )}
        </ColumnLayout>
      )}
    </PageContainer>
  )
}

// Styled Components
// ------------------------------

function ItemNotFound (props: PropsWithChildren) {
  return (
    <VStack
      alignItems="center"
      backgroundColor="surface"
      borderRadius="medium"
      gap="large"
      justifyContent="center"
      minHeight="scale.3000"
      padding="xlarge"
    >
      <Icon src={fileWarningIcon} color="neutralEmphasis" size="large" />
      <Heading align="center">Not found</Heading>
      <SlotProvider slots={{ text: { align:'center', maxWidth: 'scale.5000' } }}>
        {props.children}
      </SlotProvider>
    </VStack>
  )
}

function ResetButton (props: { onReset: () => void, hasChanges?: boolean }) {
  return (
    <DialogTrigger>
      <Button tone="accent" isDisabled={!props.hasChanges}>
        Reset
      </Button>
      <AlertDialog
        title="Reset changes"
        cancelLabel="Cancel"
        primaryActionLabel="Yes, reset"
        autoFocusButton="primary"
        onPrimaryAction={props.onReset}
      >
        Are you sure? Lost changes cannot be recovered.
      </AlertDialog>
    </DialogTrigger>
  )
}
