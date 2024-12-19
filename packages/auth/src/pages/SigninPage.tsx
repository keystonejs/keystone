import React, {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react'

import { Button } from '@keystar/ui/button'
import { TextInput } from '@keystone-ui/fields'
import { VStack } from '@keystar/ui/layout'
import {
  Heading,
  Text,
} from '@keystar/ui/typography'

import {
  useMutation,
  gql
} from '@keystone-6/core/admin-ui/apollo'
import { GraphQLErrorNotice } from '@keystone-6/core/admin-ui/components'
import { SigninContainer } from '../components/SigninContainer'

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
  const [state, setState] = useState({ identity: '', secret: '' })
  const identityFieldRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    identityFieldRef.current?.focus()
  }, [])

  const {
    authenticateItemWithPassword: mutationName,
    ItemAuthenticationWithPasswordSuccess: successTypename,
    ItemAuthenticationWithPasswordFailure: failureTypename,
  } = authGqlNames
  const [tryAuthenticate, { error, loading, data }] = useMutation(gql`
    mutation ($identity: String!, $secret: String!) {
      authenticate: ${mutationName}${identityField}: $identity, ${secretField}: $secret) {
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
      await tryAuthenticate({
        variables: {
          identity: state.identity,
          secret: state.secret,
        },
      })
    } catch (e) {
      console.error(e)
      return
    }
  }

  const pending = loading || data?.authenticate?.__typename === successTypename
  return (
    <SigninContainer title='Keystone - Sign in'>
      <VStack gap='xlarge' as='form' onSubmit={onSubmit}>
        <Heading>Sign in</Heading>
        <GraphQLErrorNotice
          errors={[
            error?.networkError,
            ...error?.graphQLErrors ?? []
          ]}
        />
        {/* TODO: FIXME, bad UI */ data?.authenticate?.__typename === failureTypename && (
          <Text>
            {data?.authenticate.message}
          </Text>
        )}
        <VStack gap='medium'>
          <TextInput
            id='identity'
            name='identity'
            value={state.identity}
            onChange={e => setState({ ...state, identity: e.target.value })}
            placeholder={identityField}
            ref={identityFieldRef}
          />
          <TextInput
            id='password'
            name='password'
            value={state.secret}
            onChange={e => setState({ ...state, secret: e.target.value })}
            placeholder={secretField}
            type='password'
          />
        </VStack>

        <VStack gap='medium'>
          <Button
            prominence="high"
            type="submit"
            isPending={pending}
          >
            Sign in
          </Button>
        </VStack>
      </VStack>
    </SigninContainer>
  )
}
