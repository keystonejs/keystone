import NextHead from 'next/head'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

import { Button } from '@keystar/ui/button'
import { Grid, HStack, VStack } from '@keystar/ui/layout'
import { Notice } from '@keystar/ui/notice'
import { PasswordField } from '@keystar/ui/password-field'
import { Content } from '@keystar/ui/slots'
import { TextField } from '@keystar/ui/text-field'
import { Heading, Text } from '@keystar/ui/typography'

import { gql, useMutation } from '@keystone-6/core/admin-ui/apollo'
import { GraphQLErrorNotice, Logo } from '@keystone-6/core/admin-ui/components'

import type { AuthGqlNames } from '../types'

export default (props: Parameters<typeof SigninPage>[0]) => () => <SigninPage {...props} />

function SigninPage({
  identityField,
  secretField,
  authGqlNames,
}: {
  identityField: string
  secretField: string
  authGqlNames: AuthGqlNames
}) {
  const router = useRouter()
  const [state, setState] = useState({ identity: '', secret: '' })
  const {
    authenticateItemWithPassword: mutationName,
    ItemAuthenticationWithPasswordSuccess: successTypename,
    ItemAuthenticationWithPasswordFailure: failureTypename,
  } = authGqlNames
  const [tryAuthenticate, { error, loading, data }] = useMutation(
    gql`
    mutation KsAuthSignin ($identity: String!, $secret: String!) {
      authenticate: ${mutationName}(${identityField}: $identity, ${secretField}: $secret) {
        ... on ${successTypename} {
          item {
            id
          }
        }
        ... on ${failureTypename} {
          message
        }
      }
    }`,
    {
      refetchQueries: ['KsFetchAdminMeta'],
    }
  )

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    if (event.target !== event.currentTarget) return
    event.preventDefault()

    try {
      const { data } = await tryAuthenticate({
        variables: {
          identity: state.identity,
          secret: state.secret,
        },
      })

      if (data.authenticate.item) {
        router.push('/')
      }
    } catch (e) {
      console.error(e)
      return
    }
  }

  const pending = loading || data?.authenticate?.__typename === successTypename

  return (
    <>
      <NextHead>
        <title key="title">Keystone - Sign in</title>
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
            Sign in
          </Heading>

          <GraphQLErrorNotice errors={[error?.networkError, ...(error?.graphQLErrors ?? [])]} />

          {data?.authenticate?.__typename === failureTypename && (
            <Notice tone="critical">
              <Content>
                <Text>{data?.authenticate.message}</Text>
              </Content>
            </Notice>
          )}

          <VStack gap="large">
            <TextField
              autoFocus
              id="identity"
              isRequired
              label={capitalizeFirstLetter(identityField)}
              name="identity"
              onChange={v => setState({ ...state, identity: v })}
              value={state.identity}
            />
            <PasswordField
              id="password"
              isRequired
              label={capitalizeFirstLetter(secretField)}
              // @ts-expect-error — valid prop, types need to be fixed in "@keystar/ui"
              name="password"
              onChange={v => setState({ ...state, secret: v })}
              type="password"
              value={state.secret}
            />
          </VStack>

          <Button isPending={pending} prominence="high" type="submit" alignSelf="start">
            Sign in
          </Button>
        </VStack>
      </Grid>
    </>
  )
}

function capitalizeFirstLetter(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
