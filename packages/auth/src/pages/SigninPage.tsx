/** @jsxRuntime classic */
/** @jsx jsx */

import {
  type FormEvent,
  Fragment,
  useEffect,
  useRef,
  useState,
} from 'react'

import { jsx, H1, Stack, VisuallyHidden } from '@keystone-ui/core'
import { Button } from '@keystone-ui/button'
import { TextInput } from '@keystone-ui/fields'
import { Notice } from '@keystone-ui/notice'

import {
  useMutation,
  gql
} from '@keystone-6/core/admin-ui/apollo'
import { SigninContainer } from '../components/SigninContainer'

export default (props: Parameters<typeof SigninPage>[0]) => () => <SigninPage {...props} />

export function SigninPage ({
  identityField,
  secretField,
  mutationName,
  successTypename,
  failureTypename,
}: {
  identityField: string
  secretField: string
  mutationName: string
  successTypename: string
  failureTypename: string
}) {
  const mutation = gql`
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
    }
  `

  const [state, setState] = useState({ identity: '', secret: '' })
  const identityFieldRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    identityFieldRef.current?.focus()
  }, [])

  const [tryAuthenticate, { error, loading, data }] = useMutation(mutation)
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

  return (
    <SigninContainer title='Keystone - Sign in'>
      <Stack gap='xlarge' as='form' onSubmit={onSubmit}>
        <H1>Sign in</H1>
        {error ? <Notice title='Error' tone='negative'>{error.message}</Notice> : null}
        {data?.authenticate?.__typename === failureTypename && (
          <Notice title='Error' tone='negative'>
            {data?.authenticate.message}
          </Notice>
        )}
        <Stack gap='medium'>
          <VisuallyHidden as='label' htmlFor='identity'>
            {identityField}
          </VisuallyHidden>
          <TextInput
            id='identity'
            name='identity'
            value={state.identity}
            onChange={e => setState({ ...state, identity: e.target.value })}
            placeholder={identityField}
            ref={identityFieldRef}
          />
          <Fragment>
            <VisuallyHidden as='label' htmlFor='password'>
              {secretField}
            </VisuallyHidden>
            <TextInput
              id='password'
              name='password'
              value={state.secret}
              onChange={e => setState({ ...state, secret: e.target.value })}
              placeholder={secretField}
              type='password'
            />
          </Fragment>
        </Stack>

        <Stack gap='medium' across>
          <Button
            weight='bold'
            tone='active'
            isLoading={
              loading ||
              // this is for while the page is loading but the mutation has finished successfully
              data?.authenticate?.__typename === successTypename
            }
            type='submit'
          >
            Sign in
          </Button>
        </Stack>
      </Stack>
    </SigninContainer>
  )
}
