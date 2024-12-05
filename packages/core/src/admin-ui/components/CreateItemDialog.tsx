/** @jsxRuntime classic */
/** @jsx jsx */

import { ButtonGroup, Button } from '@keystar/ui/button'
import { Dialog, useDialogContainer } from '@keystar/ui/dialog'
import { Content } from '@keystar/ui/slots'
import { Heading } from '@keystar/ui/typography'

import { jsx, Box } from '@keystone-ui/core'
import { LoadingDots } from '@keystone-ui/loading'

import { useKeystone, useList } from '../context'

import { Fields } from '../utils/Fields'
import { useCreateItem } from '../utils/useCreateItem'
import { GraphQLErrorNotice } from './GraphQLErrorNotice'
import { useId } from 'react'

export function CreateItemDialog ({
  listKey,
  onCreate,
}: {
  listKey: string
  onCreate: (item: { id: string, label: string }) => void
}) {
  const { createViewFieldModes } = useKeystone()
  const list = useList(listKey)
  const createItem = useCreateItem(list)
  const dialogState = useDialogContainer()
  const formId = useId()

  return (
    <Dialog>
      <Heading>Create {list.singular}</Heading>

      <Content>
        <form
          id={formId}
          onSubmit={async (e) => {
            e.preventDefault()

            // NOTE: React events bubble through portals, this prevents the
            // parent form being submitted.
            e.stopPropagation()

            const item = await createItem.create()
            if (!item) return

            onCreate({
              id: item.id,
              label: item.label ?? item.id
            })
            dialogState.dismiss()
          }}
        >
          {createViewFieldModes.state === 'loading' && <LoadingDots label="Loading create form" />}
          <GraphQLErrorNotice
            errors={[
              ...(createViewFieldModes.state === 'error' ? [createViewFieldModes.error].flat() : []),
              createItem?.error?.networkError,
              ...createItem?.error?.graphQLErrors ?? []
            ]}
          />
          <Box paddingY="xlarge">
            <Fields environment='create-dialog' {...createItem.props} />
          </Box>
        </form>
      </Content>

      <ButtonGroup>
        <Button onPress={dialogState.dismiss}>Cancel</Button>
        <Button
          form={formId}
          isPending={createItem.state === 'loading'}
          prominence="high"
          type="submit"
         >
          Create
        </Button>
      </ButtonGroup>
    </Dialog>
  )
}
