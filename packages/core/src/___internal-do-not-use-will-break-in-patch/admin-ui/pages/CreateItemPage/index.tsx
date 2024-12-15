/** @jsxRuntime classic */
/** @jsx jsx */

import { Box, jsx } from '@keystone-ui/core'
import { LoadingDots } from '@keystone-ui/loading'
import { Button } from '@keystone-ui/button'
import { Fields } from '../../../../admin-ui/utils'
import { PageContainer } from '../../../../admin-ui/components/PageContainer'
import { useKeystone, useList } from '../../../../admin-ui'
import { GraphQLErrorNotice } from '../../../../admin-ui/components'
import { type ListMeta } from '../../../../types'
import { useCreateItem } from '../../../../admin-ui/utils/useCreateItem'
import { BaseToolbar, ColumnLayout, ItemPageHeader } from '../ItemPage/common'
import { useRouter } from '../../../../admin-ui/router'
import { type Usable, use } from 'react'

function CreatePageForm (props: { list: ListMeta }) {
  const createItem = useCreateItem(props.list)
  const router = useRouter()
  const { adminPath } = useKeystone()
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
              router.push(`${adminPath}/${props.list.path}/${item.id}`)
            }
          }}
        >
          Create {props.list.singular}
        </Button>
      </BaseToolbar>
    </Box>
  )
}

type CreateItemPageProps = { params: Usable<{ listKey: string }> }

export function CreateItemPage ({ params }: CreateItemPageProps) {
  const { createViewFieldModes, listsKeyByPath } = useKeystone()
  const _params = use<{listKey: string}>(params)
  const list = useList(listsKeyByPath[_params.listKey])

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
