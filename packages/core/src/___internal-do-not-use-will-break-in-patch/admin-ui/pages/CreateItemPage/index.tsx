import { useRouter } from '../../../../admin-ui/router.tsx'

import { Button } from '@keystar/ui/button'
import { VStack } from '@keystar/ui/layout'

import { useList } from '../../../../admin-ui/index.tsx'
import { GraphQLErrorNotice } from '../../../../admin-ui/components/index.ts'
import { PageContainer } from '../../../../admin-ui/components/PageContainer.tsx'
import { Fields } from '../../../../admin-ui/utils/index.ts'
import { useCreateItem } from '../../../../admin-ui/utils/useCreateItem.ts'
import { BaseToolbar, ColumnLayout, ItemPageHeader } from '../ItemPage/common.tsx'

export const getCreateItemPage = (props: Parameters<typeof CreateItemPage>[0]) => () => (
  <CreateItemPage {...props} />
)

function CreateItemPage({ listKey }: { listKey: string }) {
  const list = useList(listKey)
  const createItem = useCreateItem(list)
  const router = useRouter()

  return (
    <PageContainer
      title={`Create ${list.singular}`}
      header={
        <ItemPageHeader
          list={list}
          actions={[]}
          value={null}
          label="Create"
          title={`Create ${list.singular}`}
          item={null}
          initialValue={null}
          onAction={null}
        />
      }
    >
      <ColumnLayout>
        <form
          onSubmit={async e => {
            if (e.target !== e.currentTarget) return
            e.preventDefault()

            const item = await createItem.create()
            if (!item) return

            router.push(`/${list.path}/${item.id}`)
          }}
          style={{ display: 'contents' }}
        >
          {/*
            Workaround for react-aria "bug" where pressing enter in a form field
            moves focus to the submit button.
            See: https://github.com/adobe/react-spectrum/issues/5940
          */}
          <button type="submit" style={{ display: 'none' }} />
          <VStack gap="large" gridArea="main" marginTop="xlarge" minWidth={0}>
            <GraphQLErrorNotice errors={[createItem.error]} />
            <Fields {...createItem.props} />
          </VStack>

          <BaseToolbar>
            <Button isPending={createItem.state === 'loading'} prominence="high" type="submit">
              Create
            </Button>
          </BaseToolbar>
        </form>
      </ColumnLayout>
    </PageContainer>
  )
}
