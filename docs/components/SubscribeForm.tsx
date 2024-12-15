/** @jsxImportSource @emotion/react */

import { Fragment, useState, type ReactNode, type HTMLAttributes, useTransition } from 'react'

import { subscribeToButtondown } from '../app/actions'

import { useMediaQuery } from '../lib/media'
import { Button } from './primitives/Button'
import { Field } from './primitives/Field'
import { Stack } from './primitives/Stack'
import { usePathname } from 'next/navigation'

type SubscriptFormProps = {
  autoFocus?: boolean
  children: ReactNode
  stacked?: boolean
} & HTMLAttributes<HTMLFormElement>

export function SubscribeForm ({ autoFocus, stacked, children, ...props }: SubscriptFormProps) {
  const pathname = usePathname()
  const mq = useMediaQuery()
  const [isPending, startTransition] = useTransition()

  const [error, setError] = useState<string | null>(null)
  const [formSubmitted, setFormSubmitted] = useState(false)

  // Augment the server action with the pathname
  const subscribeToButtondownWithPathname = subscribeToButtondown.bind(null, pathname)

  async function submitAction (formData: FormData) {
    startTransition(async () => {
      const response = await subscribeToButtondownWithPathname(formData)
      if (response.error) return setError(response.error)
      if (response.success) return setFormSubmitted(true)
    })
  }

  return !formSubmitted ? (
    <Fragment>
      {children}
      <form action={submitAction} {...props}>
        <Stack
          orientation={stacked ? 'vertical' : 'horizontal'}
          block={stacked}
          gap={5}
          css={{
            justifyItems: stacked ? 'baseline' : undefined,
          }}
        >
          <label
            htmlFor="email"
            css={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              borderWidth: '0',
            }}
          >
            Email address
          </label>
          <Field
            type="email"
            autoComplete="off"
            autoFocus={autoFocus}
            placeholder="Your email address"
            css={mq({
              maxWidth: '25rem',
              margin: ['0 auto', 0],
            })}
            name="email"
            id="email"
            required
          />

          <div css={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 0.75rem' }}>
            <div css={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <input
                type="checkbox"
                name="tags"
                id="mailing-list-keystone"
                css={{ height: '1rem', width: '1rem' }}
                value="list:keystone"
                defaultChecked
              />
              <label css={{ fontSize: '0.9rem' }} htmlFor="mailing-list-keystone">
                Keystone news
              </label>
            </div>
            <div css={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <input
                type="checkbox"
                name="tags"
                id="mailing-list-thinkmill"
                css={{ height: '1rem', width: '1rem' }}
                value="list:thinkmill"
              />
              <label css={{ fontSize: '0.9rem' }} htmlFor="mailing-list-thinkmill">
                Thinkmill news (
                <a
                  href="https://www.thinkmill.com.au/newsletter/tailwind-for-designers-multi-brand-design-systems-and-a-search-tool-for-public-domain-content"
                  target="_blank"
                  aria-label="Thinkmill (Opens in new tab)"
                >
                  example
                </a>
                )
              </label>
            </div>
          </div>

          <Button look="secondary" size="small" loading={isPending} type="submit">
            {error ? 'Try again' : 'Subscribe'}
          </Button>
        </Stack>
        {error ? (
          <p css={{ marginTop: '0.5rem', color: 'red', fontSize: '0.85rem' }}>{error}</p>
        ) : null}
      </form>
    </Fragment>
  ) : (
    <p>❤️ Thank you! Please check your email to confirm your subscription.</p>
  )
}
