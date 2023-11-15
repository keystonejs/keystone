/** @jsxRuntime classic */
/** @jsx jsx */

import { Box, jsx } from '@keystone-ui/core'
import { LoadingDots } from '@keystone-ui/loading'
import { Button } from '@keystone-ui/button'
import { useRouter } from 'next/router'
import { Fields } from '../../../../admin-ui/utils'
import { PageContainer } from '../../../../admin-ui/components/PageContainer'
import { useKeystone, useList } from '../../../../admin-ui'
import { GraphQLErrorNotice } from '../../../../admin-ui/components'
import { type ListMeta } from '../../../../types'
import { useCreateItem } from '../../../../admin-ui/utils/useCreateItem'
import { BaseToolbar, ColumnLayout, ItemPageHeader } from '../ItemPage/common'

function CreatePageForm (props: { list: ListMeta }) {
  const createItem = useCreateItem(props.list)
  const router = useRouter()
  return (
    <Box paddingTop="xlarge">
      {createItem.error && (
        <GraphQLErrorNotice
          networkError={createItem.error?.networkError}
          errors={createItem.error?.graphQLErrors}
        />
      )}

      <Fields {...createItem.props} />
      <BaseToolbar>
        <Button
          isLoading={createItem.state === 'loading'}
          weight="bold"
          tone="active"
          onClick={async () => {
            const item = await createItem.create()
            if (item) {
              router.push(`/${props.list.path}/${item.id}`)
            }
          }}
        >
          Create {props.list.singular}
        </Button>
      </BaseToolbar>
    </Box>
  )
}

type CreateItemPageProps = { listKey: string }

export const getCreateItemPage = (props: CreateItemPageProps) => () =>
  <CreateItemPage {...props} />

function CreateItemPage (props: CreateItemPageProps) {
  const list = useList(props.listKey)
  const { createViewFieldModes } = useKeystone()

  return (
    <PageContainer
      title={`Create ${list.singular}`}
      header={<ItemPageHeader list={list} label="Create" />}
    >
      <ColumnLayout>
        <Box>
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
          <CreatePageForm list={list} />
        </Box>
      </ColumnLayout>
    </PageContainer>
  )
}
