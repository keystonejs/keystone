/** @jsx jsx */

import { useState, useEffect } from 'react';
import { gql, useMutation } from '@apollo/client';
import Router from 'next/router';
import { jsx } from '@emotion/core';

import { useAuth } from '../../lib/authentication';
import { Button, Field, Group, Label, Link, Input } from '../../primitives/forms';
import { gridSize, colors } from '../../theme';

export const CREATE_FORGOT_PASSWORD_TOKEN = gql`
  mutation startPasswordRecovery($email: String!) {
    startPasswordRecovery(email: $email) {
      id
    }
  }
`;

export default ({ onSuccess, onClickSignin }) => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleSubmit = startPasswordRecovery => event => {
    event.preventDefault();
    startPasswordRecovery({ variables: { email } });
  };

  // if the user is logged in, redirect to the homepage
  useEffect(() => {
    if (isAuthenticated) {
      Router.push('/');
    }
  }, [isAuthenticated]);

  const [startPasswordRecovery, { error: mutationError, loading }] = useMutation(
    CREATE_FORGOT_PASSWORD_TOKEN,
    {
      onCompleted: () => {
        setEmailSent(true);

        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }
      },
    }
  );

  return (
    <>
      {mutationError && (
        <p css={{ color: colors.red }}>There is no account with the email "{email}"</p>
      )}

      <form
        css={{ marginTop: gridSize * 3 }}
        noValidate
        onSubmit={handleSubmit(startPasswordRecovery)}
      >
        <Field>
          <Label htmlFor="email">Email</Label>
          <Input
            required
            type="text"
            autoFocus
            autoComplete="email"
            placeholder="you@awesome.com"
            disabled={isAuthenticated}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </Field>

        <Group>
          {loading ? (
            <Button disabled>Sending email...</Button>
          ) : emailSent ? (
            <Button disabled css={{ background: colors.greyLight, color: colors.greyMedium }}>
              Email sent
            </Button>
          ) : (
            <Button type="submit">Send</Button>
          )}
          <Link href="/signin" onClick={onClickSignin}>
            Sign in
          </Link>
        </Group>
      </form>
    </>
  );
};
