/** @jsxImportSource @emotion/react */

import { Fragment, useState, type ReactNode, type SyntheticEvent, type HTMLAttributes } from 'react'

import { useMediaQuery } from '../lib/media'
import { Button } from './primitives/Button'
import { Field } from './primitives/Field'
import { Stack } from './primitives/Stack'
import { Type } from './primitives/Type'

function validEmail (email: string) {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email)
}

const enquiryUrl = 'https://endpoints.thinkmill.com.au/enquiry'

type ContactFormProps = {
  autoFocus?: boolean
  children: ReactNode
  stacked?: boolean
} & HTMLAttributes<HTMLFormElement>

export function ContactForm ({ autoFocus, stacked, children, ...props }: ContactFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const mq = useMediaQuery()

  const onSubmit = (event: SyntheticEvent) => {
    event.preventDefault()
    setError(null)
    // Basic validation check on the email?
    setLoading(true)
    if (validEmail(email)) {
      // if good post to Thinkmill endpoint
      return fetch(enquiryUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          message,
          campaignId: '@keystone-6/website',
        }),
      })
        .then(res => {
          if (res.status !== 200) {
            // We explicitly set the status in our endpoint
            // any status that isn't 200 we assume is a failure
            // which we want to surface to the user
            res.json().then(({ error }) => {
              setError(error)
              setLoading(false)
            })
          } else {
            setFormSubmitted(true)
          }
        })
        .catch(err => {
          // network errors or failed parse
          setError(err.toString())
          setLoading(false)
        })
    } else {
      setLoading(false)
      // if email fails validation set error message
      setError('Please enter a valid email')
      return
    }
  }

  return !formSubmitted ? (
    <Fragment>
      {children}
      <form onSubmit={onSubmit} {...props} aria-label="Contact us">
        <Stack
          orientation={stacked ? 'vertical' : 'horizontal'}
          block={stacked}
          css={{
            justifyItems: stacked ? 'baseline' : undefined,
            gap: '1.75rem',
          }}
        >
          <Field
            size="large"
            type="name"
            label="Name"
            id="contact-us-name"
            autoComplete="off"
            autoFocus={autoFocus}
            placeholder="Enter your name"
            value={name}
            onChange={e => setName(e.target.value)}
            css={mq({
              margin: ['0 auto', 0],
            })}
          />

          <Field
            size="large"
            type="email"
            label="Email"
            id="contact-us-email"
            autoComplete="off"
            autoFocus={autoFocus}
            placeholder="Enter your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            css={mq({
              margin: ['0 auto', 0],
            })}
          />

          <Field
            size="large"
            type="comments"
            label="Message"
            id="contact-us-message"
            autoComplete="off"
            autoFocus={autoFocus}
            placeholder="Tell us a bit about your needs"
            value={message}
            onChange={e => setMessage(e.target.value)}
            css={mq({
              margin: ['0 auto', 0],
            })}
          />

          <Button size="large" loading={loading} type={'submit'} css={{ margin: '0.5rem 0 0' }}>
            {error ? 'Try again' : 'Get in touch'}
          </Button>
        </Stack>

        {error && (
          <Type as="p" margin="1rem 0 0" color="red">
            {error}
          </Type>
        )}
      </form>
    </Fragment>
  ) : (
    <p css={{ textAlign: 'center' }}>❤️ Thank you for contacting us</p>
  )
}
