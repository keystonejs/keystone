import React, { useMemo, useState } from 'react'
import fetch from 'cross-fetch'

import { Stack, Inline } from '@keystone-ui/core'
import { Checkbox, FieldLabel, TextInput } from '@keystone-ui/fields'

import type { FieldMeta } from '@keystone-6/core/types'
import { gql, useMutation } from '@keystone-6/core/admin-ui/apollo'
import { useList } from '@keystone-6/core/admin-ui/context'
import { useRouter, Link } from '@keystone-6/core/admin-ui/router'
import { GraphQLErrorNotice } from '@keystone-6/core/admin-ui/components'
import {
  Fields,
  serializeValueToOperationItem,
  useBuildItem,
} from '@keystone-6/core/admin-ui/utils'

import { Button } from '@keystar/ui/button'
import { VStack } from '@keystar/ui/layout'
import { Heading, Text } from '@keystar/ui/typography'

import { guessEmailFromValue, validEmail } from '../lib/emailHeuristics'
import { IconTwitter, IconGithub } from '../components/Icons'
import { SigninContainer } from '../components/SigninContainer'
import { useRedirect } from '../lib/useFromRedirect'

const signupURL = 'https://endpoints.thinkmill.com.au/newsletter'

export default (props: Parameters<typeof InitPage>[0]) => () => <InitPage {...props} />

function Welcome ({ value, onContinue }: { value: any, onContinue: () => void }) {
  const [subscribe, setSubscribe] = useState<{ keystone: boolean, thinkmill: boolean}>(
    {
      keystone: false,
      thinkmill: false,
    }
  )
  const [email, setEmail] = useState<string>(guessEmailFromValue(value))
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    // Check if user wants to subscribe and a valid email address
    if (subscribe.keystone || subscribe.thinkmill) {
      setLoading(true)

      if (!validEmail(email)) {
        setError('Email is invalid')
        return
      }

      const tags = ['source:@keystone-6/auth']
      if (subscribe.keystone) tags.push('list:keystone')
      if (subscribe.thinkmill) tags.push('list:thinkmill')

      const res = await fetch(signupURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          tags,
        }),
      })

      try {
        if (res.status !== 200) {
          const { error } = await res.json()
          setError(error)
          return
        }
      } catch (e: any) {
        // network errors or failed parse
        setError(e.message.toString())
        return
      }

      setLoading(false)
    }

    onContinue()
  }

  return (
    <VStack gap="medium">
      <VStack
        gap="small"
        align="center"
        across
        css={{
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <Heading>Welcome</Heading>
        <VStack across gap="small">
          <IconTwitter
            href="https://twitter.com/keystonejs"
            target="_blank"
            title="Twitter Logo"
          />
          <IconGithub
            href="https://github.com/keystonejs/keystone"
            target="_blank"
            title="Github"
          />
        </VStack>
      </VStack>

      <p css={{ margin: 0 }}>
        Thanks for installing Keystone, for help getting started see our documentation at{' '}
        <a href="https://keystonejs.com">keystonejs.com</a>
      </p>

      <p>
        To stay connected to the latest Keystone and <a href="https://thinkmill.com.au" target='_blank'>Thinkmill</a> news, signup to our newsletters:
      </p>

      <form onSubmit={onSubmit}>
        <Stack gap="medium">
          <FieldLabel htmlFor="email-field">Email</FieldLabel>
          <TextInput
            id="email-field"
            autoFocus
            required={subscribe.keystone || subscribe.thinkmill}
            placeholder={'example@gmail.com'}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Inline gap="medium">
            <Checkbox
              size='small'
              checked={subscribe.keystone}
              onChange={() => {
                setError(null)
                setSubscribe((prevState) => ({ ...prevState, keystone: !subscribe.keystone }))
              }}
            >
              Keystone news
            </Checkbox>
            <Checkbox
              size='small'
              checked={subscribe.thinkmill}
              onChange={() => {
                setError(null)
                setSubscribe((prevState) => ({ ...prevState, thinkmill: !subscribe.thinkmill }))
              }}
            >
              Thinkmill news (
                <a
                  href="https://www.thinkmill.com.au/newsletter/tailwind-for-designers-multi-brand-design-systems-and-a-search-tool-for-public-domain-content"
                  target="_blank"
                  aria-label="Thinkmill (Opens in new tab)"
                >
                  example
                </a>
              )
            </Checkbox>
          </Inline>
        </Stack>
        <p css={{ color: 'red' }}>{error}</p>
        <Inline gap="medium" align="center">
          <Button isLoading={loading} type={'submit'} weight="bold" tone="active">
            {error ? 'Try again' : 'Continue'}
          </Button>
          {error && (
            <Button as={Link} href={'/'} tone="active">
              Continue
            </Button>
          )}
        </Inline>
      </form>
    </VStack>
  )
}

function InitPage ({
  fieldPaths,
  listKey,
  enableWelcome
}: {
  listKey: string
  fieldPaths: string[]
  enableWelcome: boolean
}) {
  const router = useRouter()
  const redirect = useRedirect()
  const list = useList(listKey)

  const fields = useMemo(() => {
    const fields: Record<string, FieldMeta> = {}
    for (const fieldPath of fieldPaths) {
      fields[fieldPath] = list.fields[fieldPath]
    }
    return fields
  }, [list, fieldPaths])

  const builder = useBuildItem(list)
  const [mode, setMode] = useState<'init' | 'welcome'>('init')

  const [createFirstItem, { loading, error, data }] =
    useMutation(gql`mutation($data: CreateInitial${listKey}Input!) {
    authenticate: createInitial${listKey}(data: $data) {
      ... on ${listKey}AuthenticationWithPasswordSuccess {
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

    const builtValue = await builder.build()
    if (!builtValue) return

    try {
      await createFirstItem({
        variables: {
          data: serializeValueToOperationItem('create', fields, builtValue)
        },
      })
    } catch (e) {
      console.error(e)
      return
    }

    if (enableWelcome) return setMode('welcome')
    router.push(redirect)
  }

  const onComplete = () => router.push(redirect)
  const pending = loading || data?.authenticate?.__typename === `${listKey}AuthenticationWithPasswordSuccess`
  return mode === 'init' ? (
    <SigninContainer title="Welcome to KeystoneJS">
      <Heading>Welcome to KeystoneJS</Heading>
      <Text>Create your first user to get started</Text>
      <form onSubmit={onSubmit}>
        <Stack gap="large">
          <GraphQLErrorNotice
            errors={[
              error?.networkError,
              ...error?.graphQLErrors ?? []
            ]}
          />
          <Fields {...builder.props} />
          <Button
            isPending={pending}
            prominence="high"
            type="submit"
          >
            Get started
          </Button>
        </Stack>
      </form>
    </SigninContainer>
  ) : (
    <SigninContainer>
      <Welcome value={builder.props.value} onContinue={onComplete} />
    </SigninContainer>
  )
}
