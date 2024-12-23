import NextHead from 'next/head'
import React, { useState } from 'react'
import fetch from 'cross-fetch'

import { gql, useMutation } from '@keystone-6/core/admin-ui/apollo'
import { useList } from '@keystone-6/core/admin-ui/context'
import { useRouter } from '@keystone-6/core/admin-ui/router'
import {
  Fields,
  useBuildItem,
} from '@keystone-6/core/admin-ui/utils'
import {
  GraphQLErrorNotice,
  Logo,
} from '@keystone-6/core/admin-ui/components'

import { Button } from '@keystar/ui/button'
import { Checkbox } from '@keystar/ui/checkbox'
import { TextField } from '@keystar/ui/text-field'
import {
  Grid,
  HStack,
  VStack
} from '@keystar/ui/layout'
import { Heading } from '@keystar/ui/typography'

import { guessEmailFromValue, validEmail } from '../lib/emailHeuristics'
import { IconTwitter, IconGithub } from '../components/Icons'
import { useRedirect } from '../lib/useFromRedirect'

import type {
  AuthGqlNames,
} from '../types'

const newsletterUrl = 'https://endpoints.thinkmill.com.au/newsletter'

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

      const res = await fetch(newsletterUrl, {
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
        style={{
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <Heading>Welcome</Heading>
        <VStack gap="small">
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

      <p style={{ margin: 0 }}>
        Thanks for installing Keystone, for help getting started see our documentation at{' '}
        <a href="https://keystonejs.com">keystonejs.com</a>
      </p>

      <p>
        To stay connected to the latest Keystone and <a href="https://thinkmill.com.au" target='_blank'>Thinkmill</a> news, signup to our newsletters:
      </p>

      <form onSubmit={onSubmit}>
        <VStack padding='medium' gap='medium'>
          <TextField
            id='email-field'
            name='email'
            autoFocus
            isRequired={subscribe.keystone || subscribe.thinkmill}
            value={email}
            onChange={v => setEmail(v)}
            placeholder={'example@gmail.com'}
          />
          <HStack gap="medium">
            <Checkbox
              isSelected={subscribe.keystone}
              onChange={() => {
                setError(null)
                setSubscribe((prevState) => ({ ...prevState, keystone: !subscribe.keystone }))
              }}
            >
              Keystone news
            </Checkbox>
            <Checkbox
              isSelected={subscribe.thinkmill}
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
          </HStack>
        </VStack>
        <p style={{ color: 'red' }}>{error}</p>
        <Button
          prominence="high"
          type="submit"
          isPending={loading}
        >
          {error ? 'Try again' : 'Continue'}
        </Button>
        {/* TODO: FIXME */ error && (
          <a href='/'>Continue</a>
        )}
      </form>
    </VStack>
  )
}

function InitPage ({
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
  const redirect = useRedirect()
  const list = useList(listKey)

  const builder = useBuildItem(list)
  const [mode, setMode] = useState<'init' | 'welcome'>('init')

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
          data: builtItem
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
  const pending = loading || data?.authenticate?.__typename === successTypename

  return (
    <>
      <NextHead>
        <title key="title">Welcome to KeystoneJS</title>
      </NextHead>
      {(mode === 'init' ? (
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
            elementType='form'
            onSubmit={onSubmit}
            // styles
            flex
            gap="xxlarge"
            paddingY="xlarge"
          >
            <Heading elementType='h1' size='regular'>Create your first user</Heading>
            <GraphQLErrorNotice
              errors={[
                error?.networkError,
                ...error?.graphQLErrors ?? []
              ]}
            />
            <Fields {...builder.props} />
            <Button
              alignSelf="start"
              isPending={pending}
              prominence="high"
              type="submit"
            >
              Get started
            </Button>
          </VStack>
        </Grid>
      ) : (
        <Welcome value={builder.props.value} onContinue={onComplete} />
      ))}
    </>
  )
}
