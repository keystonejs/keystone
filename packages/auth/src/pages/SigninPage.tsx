import { useMemo, useState } from 'react'

import { Button } from '@keystar/ui/button'
import { Grid, HStack, VStack } from '@keystar/ui/layout'
import { Notice } from '@keystar/ui/notice'
import { PasswordField } from '@keystar/ui/password-field'
import { Content } from '@keystar/ui/slots'
import { TextField } from '@keystar/ui/text-field'
import { Heading, Text } from '@keystar/ui/typography'
import { print } from 'graphql'

import { useApolloClient } from '@keystone-6/core/admin-ui/apollo'
import { GraphQLErrorNotice, Logo } from '@keystone-6/core/admin-ui/components'
import { useKeystone } from '@keystone-6/core/admin-ui/context'
import { useRouter } from '@keystone-6/core/admin-ui/router'
import { getSigninPageQuery } from '../signin-query.ts'
import type { AuthGqlNames } from '../types.ts'

export default (props: Parameters<typeof SigninPage>[0]) => () => <SigninPage {...props} />

type SigninData = {
  authenticate: { __typename: string; item?: { id: string }; message?: string }
}

type MutationState =
  | { status: 'idle' | 'loading' | 'success' }
  | { status: 'error'; error: Error }
  | { status: 'failure'; message: string }

function SigninPage({
  identityField,
  secretField,
  authGqlNames,
  persistedQueryHash,
}: {
  identityField: string
  secretField: string
  authGqlNames: AuthGqlNames
  persistedQueryHash?: string
}) {
  const router = useRouter()
  const apolloClient = useApolloClient()
  const { apiPath } = useKeystone()
  const [state, setState] = useState({ identity: '', secret: '' })
  const [mutationState, setMutationState] = useState<MutationState>({ status: 'idle' })
  const {
    ItemAuthenticationWithPasswordSuccess: successTypename,
    ItemAuthenticationWithPasswordFailure: failureTypename,
  } = authGqlNames
  const signinQuery = useMemo(
    () => print(getSigninPageQuery({ authGqlNames, identityField, secretField })),
    [authGqlNames, identityField, secretField]
  )

  const onSubmit = async (event: React.SubmitEvent) => {
    if (event.target !== event.currentTarget) return
    event.preventDefault()

    setMutationState({ status: 'loading' })

    try {
      if (!apiPath) throw new Error('The GraphQL API path is unavailable')

      const response = await fetch(apiPath, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          operationName: 'KsAuthSignin',
          query: signinQuery,
          variables: {
            identity: state.identity,
            secret: state.secret,
          },
          ...(persistedQueryHash === undefined
            ? {}
            : {
                extensions: {
                  persistedQuery: {
                    version: 1,
                    sha256Hash: persistedQueryHash,
                  },
                },
              }),
        }),
      })
      const result = (await response.json()) as {
        data?: SigninData
        errors?: { message: string }[]
      }

      if (result.errors?.length) {
        throw new Error(result.errors.map(error => error.message).join('\n'))
      }
      if (!response.ok) throw new Error(`Sign in failed with status ${response.status}`)
      if (!result.data) throw new Error('The sign-in response contained no data')

      const { authenticate } = result.data

      if (authenticate.__typename === successTypename && authenticate.item) {
        setMutationState({ status: 'success' })
        await apolloClient.refetchQueries({ include: ['KsFetchAdminMeta'] })
        router.push('/')
      } else if (authenticate.__typename === failureTypename) {
        setMutationState({
          status: 'failure',
          message: authenticate.message ?? 'Sign in failed',
        })
      } else {
        throw new Error('The sign-in response was invalid')
      }
    } catch (e) {
      console.error(e)
      setMutationState({
        status: 'error',
        error: e instanceof Error ? e : new Error('Sign in failed'),
      })
    }
  }

  const pending = mutationState.status === 'loading' || mutationState.status === 'success'

  return (
    <>
      <title>Keystone - Sign in</title>
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

          <GraphQLErrorNotice
            errors={[mutationState.status === 'error' ? mutationState.error : undefined]}
          />

          {mutationState.status === 'failure' && (
            <Notice tone="critical">
              <Content>
                <Text>{mutationState.message}</Text>
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

          <Button alignSelf="start" isPending={pending} prominence="high" type="submit">
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
