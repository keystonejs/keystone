/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, Box } from '@keystone-ui/core'
import { Drawer } from '@keystone-ui/modals'
import { LoadingDots } from '@keystone-ui/loading'

import { useKeystone, useList } from '../context'

import { Fields } from '../utils/Fields'
import { useCreateItem } from '../utils/useCreateItem'
import { GraphQLErrorNotice } from './GraphQLErrorNotice'

export function CreateItemDrawer ({
  listKey,
  onClose,
  onCreate,
}: {
  listKey: string
  onClose: () => void
  onCreate: (item: { id: string, label: string }) => void
}) {
  const { createViewFieldModes } = useKeystone()
  const list = useList(listKey)
  const createItemState = useCreateItem(list)

  return (
    <Drawer
      title={`Create ${list.singular}`}
      width="wide"
      actions={{
        confirm: {
          label: `Create ${list.singular}`,
          loading: createItemState.state === 'loading',
          action: async () => {
            const item = await createItemState.create()
            if (item) {
              onCreate({ id: item.id, label: item.label || item.id })
            }
          },
        },
        cancel: {
          label: 'Cancel',
          action: () => {
            if (
              !createItemState.shouldPreventNavigation ||
              window.confirm('There are unsaved changes, are you sure you want to exit?')
            ) {
              onClose()
            }
          },
        },
      }}
    >
      {createViewFieldModes.state === 'error' && (
        <GraphQLErrorNotice
          networkError={
            createViewFieldModes.error instanceof Error ? createViewFieldModes.error : undefined
          }
          errors={
            createViewFieldModes.error instanceof Error ? undefined : createViewFieldModes.error
          }
        />
      )}
      {createViewFieldModes.state === 'loading' && <LoadingDots label="Loading create form" />}
      {createItemState.error && (
        <GraphQLErrorNotice
          networkError={createItemState.error?.networkError}
          errors={createItemState.error?.graphQLErrors}
        />
      )}
      <Box paddingY="xlarge">
        <Fields {...createItemState.props} />
      </Box>
    </Drawer>
  )
}
