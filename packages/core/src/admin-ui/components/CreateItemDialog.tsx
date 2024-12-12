/** @jsxRuntime classic */
/** @jsx jsx */

import { ButtonGroup, Button } from '@keystar/ui/button'
import { Dialog, useDialogContainer } from '@keystar/ui/dialog'
import { Content } from '@keystar/ui/slots'
import { Heading } from '@keystar/ui/typography'

import { jsx, Box } from '@keystone-ui/core'
import { useList } from '../context'

import { Fields } from '../utils/Fields'
import { useBuildItem } from '../utils/useCreateItem'
import { useId } from 'react'

export function BuildItemDialog ({
  listKey,
  onChange,
}: {
  listKey: string
  onChange: (subItem: Record<string, unknown>) => void
}) {
  const list = useList(listKey)
  const buildItem = useBuildItem(list)
  const dialogState = useDialogContainer()
  const formId = useId()

  return (
    <Dialog>
      <Heading>Add {list.singular}</Heading>

      <Content>
        <form
          id={formId}
          onSubmit={async (e) => {
            e.preventDefault()

            // NOTE: React events bubble through portals, this prevents the
            // parent form being submitted.
            e.stopPropagation()

            const subItem = await buildItem.build()
            if (!subItem) return

            onChange(subItem)
            dialogState.dismiss()
          }}
        >
          <Box paddingY="xlarge">
            <Fields view="createView" {...buildItem.props} />
          </Box>
        </form>
      </Content>

      <ButtonGroup>
        <Button onPress={dialogState.dismiss}>Cancel</Button>
        <Button
          form={formId}
          isPending={buildItem.state === 'loading'}
          prominence="high"
          type="submit"
         >
           Add
        </Button>
      </ButtonGroup>
    </Dialog>
  )
}
