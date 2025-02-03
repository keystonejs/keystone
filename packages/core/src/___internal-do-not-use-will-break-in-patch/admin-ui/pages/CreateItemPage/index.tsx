import React from 'react'
import { useRouter } from 'next/router'

import { Button } from '@keystar/ui/button'
import { VStack } from '@keystar/ui/layout'
import { LoadingDots } from '@keystone-ui/loading'

import { Fields } from '../../../../admin-ui/utils'
import { PageContainer } from '../../../../admin-ui/components/PageContainer'
import { useKeystone, useList } from '../../../../admin-ui'
import { GraphQLErrorNotice } from '../../../../admin-ui/components'
import { useCreateItem } from '../../../../admin-ui/utils/useCreateItem'
import { BaseToolbar, ColumnLayout, ItemPageHeader } from '../ItemPage/common'

type CreateItemPageProps = { listKey: string }

export const getCreateItemPage = (props: CreateItemPageProps) => () => <CreateItemPage {...props} />

function CreateItemPage (props: CreateItemPageProps) {
  const router = useRouter()
  const list = useList(props.listKey)
  const createItem = useCreateItem(list)
  const { createViewFieldModes } = useKeystone()

  return (
    <PageContainer
      title={`Create ${list.singular}`}
      header={<ItemPageHeader list={list} label="Create" title={`Create ${list.singular}`} />}
    >
      {createViewFieldModes.state === 'loading' ? (
        <LoadingDots label="preparing form" />
      ) : (
        <ColumnLayout>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const item = await createItem.create()
              if (item) {
                router.push(`/${list.path}/${item.id}`)
              }
            }}
            style={{
              display: 'contents',
            }}
          >
            {/*
              Workaround for react-aria "bug" where pressing enter in a form field
              moves focus to the submit button.
              See: https://github.com/adobe/react-spectrum/issues/5940
            */}
            <button type="submit" style={{ display: 'none' }} />
            <VStack gap="large" gridArea="main" marginTop="xlarge" minWidth={0}>
              {createViewFieldModes.state === 'error' && (
                <GraphQLErrorNotice
                  networkError={
                    createViewFieldModes.error instanceof Error
                      ? createViewFieldModes.error
                      : undefined
                  }
                  errors={
                    createViewFieldModes.error instanceof Error
                      ? undefined
                      : createViewFieldModes.error
                  }
                />
              )}

              {createItem.error && (
                <GraphQLErrorNotice
                  networkError={createItem.error?.networkError}
                  errors={createItem.error?.graphQLErrors}
                />
              )}

              <Fields environment='create-page' {...createItem.props} />
            </VStack>

            <BaseToolbar>
              <Button
                isPending={createItem.state === 'loading'}
                prominence="high"
                type="submit"
              >
                Create
                {/* Create {list.singular.toLocaleLowerCase()} */}
              </Button>
            </BaseToolbar>
          </form>
        </ColumnLayout>
      )}
    </PageContainer>
  )
}
