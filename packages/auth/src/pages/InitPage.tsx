import NextHead from 'next/head'

import { Button } from '@keystar/ui/button'
import { Grid, HStack, VStack } from '@keystar/ui/layout'
import { Heading } from '@keystar/ui/typography'

import { gql, type TypedDocumentNode, useMutation } from '@keystone-6/core/admin-ui/apollo'
import { GraphQLErrorNotice, Logo } from '@keystone-6/core/admin-ui/components'
import { useList } from '@keystone-6/core/admin-ui/context'
import { useRouter } from '@keystone-6/core/admin-ui/router'
import { Fields, useBuildItem } from '@keystone-6/core/admin-ui/utils'

import { useRedirect } from '../lib/useFromRedirect'
import type { AuthGqlNames } from '../types'

export default (props: Parameters<typeof InitPage>[0]) => () => <InitPage {...props} />

function InitPage({
  authGqlNames,
  listKey,
  fieldPaths,
}: {
  authGqlNames: AuthGqlNames
  listKey: string
  fieldPaths: string[]
}) {
  const router = useRouter()
  const redirect = useRedirect()
  const list = useList(listKey)

  const builder = useBuildItem(list, fieldPaths)
  const {
    createInitialItem,
    CreateInitialInput,
    ItemAuthenticationWithPasswordSuccess: successTypename,
  } = authGqlNames
  const [tryCreateItem, { loading, error, data }] = useMutation(
    gql`
    mutation KsAuthCreateFirstItem ($data: ${CreateInitialInput}!) {
      authenticate: ${createInitialItem}(data: $data) {
        ... on ${successTypename} {
          item {
            id
          }
        }
      }
    }` as TypedDocumentNode<
      { authenticate: { __typename: string; item: { id: string } } },
      { data: Record<string, unknown> }
    >
  )

  const onSubmit = async (e: React.FormEvent) => {
    if (e.target !== e.currentTarget) return
    e.preventDefault()
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

    router.push(redirect)
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
          <GraphQLErrorNotice errors={[error]} />
          <Fields {...builder.props} />
          <Button alignSelf="start" isPending={pending} prominence="high" type="submit">
            Get started
          </Button>
        </VStack>
      </Grid>
    </>
  )
}
