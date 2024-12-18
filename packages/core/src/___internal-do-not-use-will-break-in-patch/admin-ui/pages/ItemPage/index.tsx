import React, {
  type PropsWithChildren,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/router'

import { Button } from '@keystar/ui/button'
import { Icon } from '@keystar/ui/icon'
import { fileWarningIcon } from '@keystar/ui/icon/icons/fileWarningIcon'
import { AlertDialog, DialogContainer, DialogTrigger } from '@keystar/ui/dialog'
import { Box, VStack } from '@keystar/ui/layout'
import { ProgressCircle } from '@keystar/ui/progress'
import { SlotProvider } from '@keystar/ui/slots'
import { toastQueue } from '@keystar/ui/toast'
import { Heading, Text } from '@keystar/ui/typography'

import type { ListMeta } from '../../../../types'
import {
  Fields,
  useInvalidFields,
  deserializeItemToValue,
  serializeValueToOperationItem,
  useHasChanges,
} from '../../../../admin-ui/utils'
import { gql, useMutation } from '../../../../admin-ui/apollo'
import {
  useList,
  useListItem,
} from '../../../../admin-ui/context'
import { PageContainer } from '../../../../admin-ui/components/PageContainer'
import { GraphQLErrorNotice } from '../../../../admin-ui/components/GraphQLErrorNotice'
import { CreateButtonLink } from '../../../../admin-ui/components/CreateButtonLink'
import { ErrorDetailsDialog } from '../../../../admin-ui/components/Errors'
import {
  BaseToolbar,
  ColumnLayout,
  ItemPageHeader,
  StickySidebar
} from './common'

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

function ItemForm ({
  listKey,
  initialValue,
  onSaveSuccess,
}: {
  listKey: string
  initialValue: Record<string, unknown>
  onSaveSuccess: Function
}) {
  const list = useList(listKey)
  const [errorDialogValue, setErrorDialogValue] = useState<Error | null>(null)
  const [update, { loading, error }] = useMutation(
    gql`mutation ($data: ${list.graphql.names.updateInputName}!, $id: ID!) {
      item: ${list.graphql.names.updateMutationName}(where: { id: $id }, data: $data) {
        id
      }
    }`,
    { errorPolicy: 'all' }
  )

  const [value, setValue] = useState(() => initialValue)
  function resetValueState () {
    setValue(() => initialValue)
  }
  useEffect(() => resetValueState(), [initialValue])

  const invalidFields = useInvalidFields(list.fields, value)
  const [forceValidation, setForceValidation] = useState(false)
  const onSave = useEventCallback(async (e) => {
    e.preventDefault()
    const newForceValidation = invalidFields.size !== 0
    setForceValidation(newForceValidation)
    if (newForceValidation) return

    const { errors } = await update({
      variables: {
        data: serializeValueToOperationItem('update', list.fields, value, initialValue),
        id: itemId
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

    onSaveSuccess()
  })

  const itemId = (value.id ?? '') as (string | number)
  const labelFieldValue = list.isSingleton ? list.label : (value[list.labelField] as string)
  const hasChangedFields = useHasChanges('update', list.fields, value, initialValue)

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
            errors={[
              error?.networkError,
              // we're checking for path.length === 1 because errors with a path larger than 1 will be field level errors
              // which are handled seperately and do not indicate a failure to update the item
              ...error?.graphQLErrors.filter(x => x.path?.length === 1) ?? []
            ]}
          />
          <Fields
            view='itemView'
            position="form"
            fields={list.fields}
            groups={list.groups}
            forceValidation={forceValidation}
            invalidFields={invalidFields}
            onChange={useCallback(value => setValue(value), [setValue])}
            value={value}
          />
        </VStack>

        <StickySidebar>
          <Fields
            view='itemView'
            position="sidebar"
            fields={list.fields}
            groups={list.groups}
            forceValidation={forceValidation}
            invalidFields={invalidFields}
            onChange={useCallback(value => setValue(value), [setValue])}
            value={value}
          />
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
            onReset={resetValueState}
          />
          <Box flex />
          {!list.hideDelete ? (
            <DeleteButton
              list={list}
              itemLabel={labelFieldValue ?? itemId.toString()}
              itemId={itemId.toString()}
            />
          ) : null}
        </BaseToolbar>
      </form>

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
  const {
    data,
    error,
    loading,
    refetch
  } = useListItem(listKey, id ?? null)

  const pageLoading = loading || id === undefined
  const pageLabel = (data && data.item && (data.item[list.labelField] || data.item.id)) || id
  const pageTitle: string = list.isSingleton ? list.label : pageLoading ? undefined : pageLabel
  const initialValue = useMemo(() => {
    const { item = null } = data ?? {}
    return deserializeItemToValue(list.fields, item)
  }, [list.fields, data?.item])

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
      ) : (
        <ColumnLayout>
          <Box marginY="xlarge">
            <GraphQLErrorNotice
              errors={[
                error?.networkError,
                ...error?.graphQLErrors ?? []
              ]}
            />
            {data?.item == null && (
              list.isSingleton ? (
                id === '1' ? (
                  <ItemNotFound>
                    <Text>“{list.label}” doesn’t exist, or you don’t have access to it.</Text>
                    {!list!.hideCreate && <CreateButtonLink list={list} />}
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
              )
            )}
          </Box>
          {initialValue && (
            <ItemForm
              listKey={listKey}
              initialValue={initialValue}
              onSaveSuccess={refetch}
            />
          )}
        </ColumnLayout>
      )}
    </PageContainer>
  )
}
