import { useNavigate } from '@keystar/ui/router'
import { Button } from '@keystar/ui/button'
import { VStack } from '@keystar/ui/layout'

import { useList } from '../../index.tsx'
import { GraphQLErrorNotice } from '../../components/index.ts'
import { PageContainer } from '../../components/PageContainer.tsx'
import { Fields } from '../../utils/index.ts'
import { useCreateItem } from '../../utils/useCreateItem.ts'
import { BaseToolbar, ColumnLayout, ItemPageHeader } from '../ItemPage/common.tsx'

export function CreateItemPage({ listKey }: { listKey: string }) {
  const list = useList(listKey)
  const createItem = useCreateItem(list)
  const isPending = createItem.state !== 'editing'
  const navigate = useNavigate()

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

            navigate(`/${list.path}/${item.id}`)
          }}
          style={{ display: 'contents' }}
        >
          <VStack gap="large" gridArea="main" marginTop="xlarge" minWidth={0}>
            <GraphQLErrorNotice errors={[createItem.error]} />
            <Fields {...createItem.props} />
          </VStack>

          <BaseToolbar>
            <Button isPending={isPending} prominence="high" type="submit">
              Create
            </Button>
          </BaseToolbar>
        </form>
      </ColumnLayout>
    </PageContainer>
  )
}
