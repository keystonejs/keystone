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
 const dialogState = useDialogContainer()
 const list = useList(props.listKey)
 const formId = useId()
 const createItemState = useCreateItem(list)

 const handleCreate = async () => {
   const item = await createItemState.create()
   if (!item) return

   props.onCreate({
     id: item.id as string,
     label: (item.label as string) ?? `${item.id}`
   })
   dialogState.dismiss()
 }

 return (
   <Dialog>
     <Heading>
       Create {list.singular}
     </Heading>

     <Content>
       <form id={formId} onSubmit={handleCreate}>
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
           <Fields environment='create-dialog' {...createItemState.props} />
         </Box>
       </form>
     </Content>

     <ButtonGroup>
       <Button onPress={dialogState.dismiss}>Cancel</Button>
       <Button
         form={formId}
         isPending={createItemState.state === 'loading'}
         prominence="high"
         type="submit"
        >

         Create
       </Button>
     </ButtonGroup>
   </Dialog>
 )
}