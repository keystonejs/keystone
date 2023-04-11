/** @jsxRuntime classic */
/** @jsx jsx */
import { Fragment, useState, ReactNode, SyntheticEvent, HTMLAttributes } from 'react';
import { jsx } from '@emotion/react';

import { useMediaQuery } from '../lib/media';
import { Button } from './primitives/Button';
import { Field } from './primitives/Field';
import { Stack } from './primitives/Stack';

const validEmail = (email: string) =>
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
    email
  );

const signupURL = 'https://signup.keystonejs.cloud/api/newsletter-signup';

type ContactFormProps = {
  autoFocus?: boolean;
  children: ReactNode;
  stacked?: boolean;
} & HTMLAttributes<HTMLFormElement>;

export function ContactForm({ autoFocus, stacked, children, ...props }: ContactFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const mq = useMediaQuery();

  const onSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    setError(null);
    // Check if user wants to subscribe.
    // and there's a valid email address.
    // Basic validation check on the email?
    setLoading(true);
    if (validEmail(email)) {
      // if good add email to mailing list
      // and redirect to dashboard.
      return fetch(signupURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: '@keystone-6/website',
        }),
      })
        .then(res => {
          if (res.status !== 200) {
            // We explicitly set the status in our endpoint
            // any status that isn't 200 we assume is a failure
            // which we want to surface to the user
            res.json().then(({ error }) => {
              setError(error);
              setLoading(false);
            });
          } else {
            setFormSubmitted(true);
          }
        })
        .catch(err => {
          // network errors or failed parse
          setError(err.toString());
          setLoading(false);
        });
    } else {
      setLoading(false);
      // if email fails validation set error message
      setError('Please enter a valid email');
      return;
    }
  };

  return !formSubmitted ? (
    <Fragment>
      {children}
      <form onSubmit={onSubmit} {...props}>
        <Stack
          orientation={stacked ? 'vertical' : 'horizontal'}
          block={stacked}
          css={{
            justifyItems: stacked ? 'baseline' : undefined,
            gap: '1rem',
          }}
        >
          <Field
            type="name"
            autoComplete="off"
            autoFocus={autoFocus}
            placeholder="Your name"
            value={email}
            onChange={e => setEmail(e.target.value)}
            css={mq({
              margin: ['0 auto', 0],
            })}
          />
          <Field
            type="email"
            autoComplete="off"
            autoFocus={autoFocus}
            placeholder="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            css={mq({
              margin: ['0 auto', 0],
            })}
          />
          <Field
            type="comments"
            autoComplete="off"
            autoFocus={autoFocus}
            placeholder="Tell us a bit about your needs"
            value={email}
            onChange={e => setEmail(e.target.value)}
            css={mq({
              margin: ['0 auto', 0],
            })}
          />
          <Button look="primary" size="small" loading={loading} type={'submit'}>
            {error ? 'Try again' : 'Get in touch'}
          </Button>
        </Stack>
        {error ? <p css={{ margin: '0.5rem, 0', color: 'red' }}>{error}</p> : null}
      </form>
    </Fragment>
  ) : (
    <p>❤️ Thank you for subscribing!</p>
  );
}
