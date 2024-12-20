import NextHead from 'next/head'
import React, {
  type FormEvent,
  useState,
} from 'react'

import { useRouter } from '@keystone-6/core/admin-ui/router'
import { Button } from '@keystar/ui/button'
import { TextField } from '@keystar/ui/text-field'
import {
  Box,
  VStack,
} from '@keystar/ui/layout'
import {
  Heading,
  Text,
} from '@keystar/ui/typography'

import {
  useMutation,
  gql
} from '@keystone-6/core/admin-ui/apollo'
import {
  GraphQLErrorNotice,
} from '@keystone-6/core/admin-ui/components'

import type {
  AuthGqlNames,
} from '../types'

export default (props: Parameters<typeof SigninPage>[0]) => () => <SigninPage {...props} />

function SigninPage ({
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
  const [tryAuthenticate, { error, loading, data }] = useMutation(gql`
    mutation ($identity: String!, $secret: String!) {
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
    }`)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
    <PageWrapper>
      <NextHead>
        <title key="title">Keystone - Sign in</title>
      </NextHead>
      <VStack gap='xlarge'>
        <Box padding="xlarge">
          <Heading>Sign in</Heading>
          <GraphQLErrorNotice
            errors={[
              error?.networkError,
              ...error?.graphQLErrors ?? []
            ]}
          />
          {/* TODO: FIXME, use notice */ data?.authenticate?.__typename === failureTypename && (
            <Text>
              {data?.authenticate.message}
            </Text>
          )}
          <form onSubmit={onSubmit}>
            <VStack padding='medium' gap='medium'>
              <TextField
                id='identity'
                name='identity'
                autoFocus
                value={state.identity}
                onChange={v => setState({ ...state, identity: v })}
                placeholder={identityField}
              />
              <TextField
                type='password'
                id='password'
                name='password'
                value={state.secret}
                onChange={v => setState({ ...state, secret: v })}
                placeholder={secretField}
              />
              <Button
                isPending={pending}
                prominence="high"
                type="submit"
              >
                Sign in
              </Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </PageWrapper>
  )
}
