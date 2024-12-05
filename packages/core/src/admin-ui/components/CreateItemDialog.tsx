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

export function CreateItemDialog (props: {
 listKey: string
 onCreate: (item: { id: string, label: string }) => void
}) {
  const { createViewFieldModes } = useKeystone()
  const list = useList(props.listKey)
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

            // NOTE: This little hack prevents the parent form being submitted.
            // However, it's not clear why this is necessary since the modal
            // dialog is rendered outside the parent form in the DOM.
            e.stopPropagation()
            
            const item = await createItem.create()

            if (item) {
              props.onCreate({
                id: item.id as string,
                label: (item.label as string) ?? `${item.id}`
              })
              dialogState.dismiss()
            }
          }}
        >
          {createViewFieldModes.state === 'error' && (
            <GraphQLErrorNotice
              networkError={createViewFieldModes.error instanceof Error ? createViewFieldModes.error : undefined}
              errors={createViewFieldModes.error instanceof Error ? undefined : createViewFieldModes.error}
            />
          )}
          {createViewFieldModes.state === 'loading' && <LoadingDots label="Loading create form" />}
          {createItem.error && (
            <GraphQLErrorNotice
              networkError={createItem.error?.networkError}
              errors={createItem.error?.graphQLErrors}
            />
          )}
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
