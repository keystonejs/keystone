/** @jsx jsx */
import { Fragment, useState } from 'react';
import { jsx, Stack } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
import { TextInput } from '@keystone-ui/fields';

const validEmail = (email: string) =>
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
    email
  );

const signupURL = 'https://signup.keystonejs.cloud/api/newsletter-signup';

export const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const onSubmit = event => {
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
          source: '@keystone-next/website Index',
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
      setError('Email is invalid');
      return;
    }
  };
  return (
    <Fragment>
      {!formSubmitted ? (
        <form onSubmit={onSubmit}>
          <Stack across gap="small">
            <Stack gap="small">
              <TextInput autoFocus value={email} onChange={e => setEmail(e.target.value)} />
              <p css={{ margin: '0 !important', color: 'red' }}>{error}</p>
            </Stack>
            <Button isLoading={loading} type={'submit'} weight="bold" tone="active">
              {error ? 'Try again' : 'Signup'}
            </Button>
          </Stack>
        </form>
      ) : (
        <p>Thank you</p>
      )}
    </Fragment>
  );
};
