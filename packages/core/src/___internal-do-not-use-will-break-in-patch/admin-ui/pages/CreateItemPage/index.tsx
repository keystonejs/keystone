/** @jsxRuntime classic */
/** @jsx jsx */

import { Box, jsx } from '@keystone-ui/core'
import { Button } from '@keystone-ui/button'
import { useRouter } from 'next/router'
import { Fields } from '../../../../admin-ui/utils'
import { PageContainer } from '../../../../admin-ui/components/PageContainer'
import { useList } from '../../../../admin-ui'
import { GraphQLErrorNotice } from '../../../../admin-ui/components'
import { useCreateItem } from '../../../../admin-ui/utils/useCreateItem'
import { BaseToolbar, ConfirmButton, ColumnLayout, ItemPageHeader } from '../ItemPage/common'

function CreateItemPage ({ listKey }: { listKey: string }) {
  const router = useRouter()
  const list = useList(listKey)
  const {
    loading,
    error,
    itemLabel,
    fieldsProps,
    create,
    reset
  } = useCreateItem(list)

  return (
    <PageContainer
      title={`Create ${itemLabel}`}
      header={<ItemPageHeader list={list} label="Create" />}
    >
      <ColumnLayout>
        <Box>
          <Box paddingTop="xlarge">
            <GraphQLErrorNotice networkError={error?.networkError} errors={error?.graphQLErrors} />
            <Fields {...fieldsProps} />
            <BaseToolbar>
              <Button
                isLoading={loading}
                weight="bold"
                tone="active"
                onClick={async () => {
                  const item = await create()
                  if (item) return void router.push(`/${list.path}/${item.id}`)
                }}
              >
                Create {list.singular}
              </Button>
              <ConfirmButton
                title="Reset to defaults"
                message="Are you sure you want to reset to the defaults?"
                onClick={async () => await reset()}
              />
            </BaseToolbar>
          </Box>
        </Box>
      </ColumnLayout>
    </PageContainer>
  )
}

export const getCreateItemPage = (props: Parameters<typeof CreateItemPage>[0]) => () => <CreateItemPage {...props} />
