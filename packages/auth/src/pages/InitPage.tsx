import NextHead from 'next/head'
import React from 'react'

import { gql, useMutation } from '@keystone-6/core/admin-ui/apollo'
import { useKeystone, useList } from '@keystone-6/core/admin-ui/context'
import { useRouter } from '@keystone-6/core/admin-ui/router'
import { Fields, useBuildItem } from '@keystone-6/core/admin-ui/utils'
import { GraphQLErrorNotice, Logo } from '@keystone-6/core/admin-ui/components'
import { Button } from '@keystar/ui/button'
import { Grid, HStack, VStack } from '@keystar/ui/layout'
import { Heading } from '@keystar/ui/typography'
import type { AuthGqlNames } from '../types'

export default (props: Parameters<typeof InitPage>[0]) => () => <InitPage {...props} />

function InitPage({
  authGqlNames,
  listKey,
  fieldPaths,
  enableWelcome,
}: {
  authGqlNames: AuthGqlNames
  listKey: string
  fieldPaths: string[]
  enableWelcome: boolean
}) {
  const router = useRouter()
  const { adminPath } = useKeystone()
  const list = useList(listKey)

  const builder = useBuildItem(list)
  const {
    createInitialItem,
    CreateInitialInput,
    ItemAuthenticationWithPasswordSuccess: successTypename,
  } = authGqlNames
  const [tryCreateItem, { loading, error, data }] = useMutation(gql`
    mutation KsAuthCreateFirstItem ($data: ${CreateInitialInput}!) {
      authenticate: ${createInitialItem}(data: $data) {
        ... on ${successTypename} {
          item {
            id
          }
        }
      }
    }`)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // NOTE: React events bubble through portals, this prevents the
    // parent form being submitted.
    e.stopPropagation()

    const builtItem = await builder.build()
    if (!builtItem) return

    try {
      await tryCreateItem({
        variables: {
          data: builtItem,
        },
      })
    } catch (e) {
      console.error(e)
      return
    }

    router.push(adminPath || '/')
  }

  const pending = loading || data?.authenticate?.__typename === successTypename

  return (
    <>
      <NextHead>
        <title key="title">Welcome to KeystoneJS</title>
      </NextHead>
      <Grid
        alignItems="center"
        marginX="auto"
        maxWidth="100%"
        minHeight="100vh"
        minWidth={0}
        paddingX="xlarge"
        rows="auto 1fr"
        width="container.xsmall"
      >
        <HStack paddingY="xlarge">
          <Logo />
        </HStack>

        <VStack
          elementType="form"
          onSubmit={onSubmit}
          // styles
          flex
          gap="xxlarge"
          paddingY="xlarge"
        >
          <Heading elementType="h1" size="regular">
            Create your first user
          </Heading>
          <GraphQLErrorNotice errors={[error?.networkError, ...(error?.graphQLErrors ?? [])]} />
          <Fields {...builder.props} />
          <Button alignSelf="start" isPending={pending} prominence="high" type="submit">
            Get started
          </Button>
        </VStack>
      </Grid>
    </>
  )
}
