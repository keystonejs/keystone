/** @jsxRuntime classic */
/** @jsx jsx */

import copyToClipboard from 'clipboard-copy'
import { useRouter } from 'next/router'
import { type HTMLAttributes, } from 'react'

import { Button } from '@keystone-ui/button'
import { Box, Stack, Text, jsx, useTheme } from '@keystone-ui/core'
import { ClipboardIcon } from '@keystone-ui/icons/icons/ClipboardIcon'
import { Tooltip } from '@keystone-ui/tooltip'
import { FieldLabel, TextInput } from '@keystone-ui/fields'
import { Fields } from '../../../../admin-ui/utils'

import { useList } from '../../../../admin-ui/context'
import { PageContainer } from '../../../../admin-ui/components/PageContainer'
import { GraphQLErrorNotice } from '../../../../admin-ui/components/GraphQLErrorNotice'
import { BaseToolbar, ConfirmButton, ColumnLayout, ItemPageHeader } from '../ItemPage/common'
import { useEditItem } from '../../../../admin-ui/utils/useEditItem'

function StickySidebar (props: HTMLAttributes<HTMLDivElement>) {
  const { spacing } = useTheme()
  return (
    <div
      css={{
        marginTop: spacing.xlarge,
        marginBottom: spacing.xxlarge,
        position: 'sticky',
        top: spacing.xlarge,
      }}
      {...props}
    />
  )
}

function ItemPage ({ listKey }: { listKey: string }) {
  const { spacing, typography } = useTheme()
  const router = useRouter()
  const list = useList(listKey)
  const itemId = router.query.id as string ?? ''
  const {
    ready,
    loading,
    error,
    itemLabel,
    changed,
    fieldsProps,
    update,
    delete: delete_,
    reset
  } = useEditItem(list, itemId)

  if (!ready) return <PageContainer title={`${list.singular} ...`} header={<ItemPageHeader list={list} label={'...'} />} >{null}</PageContainer>
  return (
    <PageContainer
      title={`${list.singular} ${itemLabel}`}
      header={<ItemPageHeader list={list} label={itemLabel} />}
    >
      <ColumnLayout>
        <Box>
          <Box paddingTop="xlarge">
            <GraphQLErrorNotice networkError={error?.networkError} errors={error?.graphQLErrors} />
            <Fields {...fieldsProps} position="form" />
            <BaseToolbar>
              <Button
                isDisabled={!changed}
                isLoading={loading}
                weight="bold"
                tone="active"
                onClick={async () => {
                  const item = await update()
                  // TODO: unnecessary?
                  if (item) return void router.push(`/${list.path}/${item.id}`)
                }}
              >
                Save changes
              </Button>
              <Stack align="center" across gap="small">
                {changed ? <ConfirmButton
                  title="Reset changes"
                  message="Are you sure you want to reset your changes?"
                  onClick={async () => await reset()}
                /> : <Text weight="medium" paddingX="large" color="neutral600">
                  No changes
                </Text>}
                <ConfirmButton
                  title="Delete"
                  message={`Are you sure you want to delete ${itemLabel}?`}
                  onClick={async () => {
                    const item = await delete_()
                    if (item) return void router.push(`/${list.path}`)
                  }}
                >
                  Are you sure you want to delete <strong>{itemLabel}</strong>?
                </ConfirmButton>
              </Stack>
            </BaseToolbar>
          </Box>
        </Box>
        <Box paddingTop="xlarge">
          <StickySidebar>
            <FieldLabel>Item ID</FieldLabel>
            <div
              css={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <TextInput
                css={{
                  marginRight: spacing.medium,
                  fontFamily: typography.fontFamily.monospace,
                  fontSize: typography.fontSize.small,
                }}
                readOnly
                value={itemId}
              />
              <Tooltip content="Copy ID">
                {props => (
                  <Button {...props} aria-label="Copy ID" onClick={() => void copyToClipboard(itemId)}>
                    <ClipboardIcon size="small" />
                  </Button>
                )}
              </Tooltip>
            </div>
            <Box marginTop="xlarge">
              <Fields {...fieldsProps} position="sidebar" />
            </Box>
          </StickySidebar>
        </Box>
      </ColumnLayout>
    </PageContainer>
  )
}

export const getItemPage = (props: Parameters<typeof ItemPage>[0]) => () => <ItemPage {...props} />
