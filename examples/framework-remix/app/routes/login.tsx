import type { ActionArgs } from '@remix-run/node';
import React from 'react';
import { useActionData, useSearchParams } from '@remix-run/react';

import { keystoneContext } from '../utils/keystone.server';
import { badRequest } from '../utils/request.server';
import { createUserSession, login } from '../utils/session.server';

// This Remix Login page is from the Remix Jokes App Tutorial
// https://remix.run/docs/en/main/tutorials/jokes
// with a few changes that are specific to Keystone

function validateemail(email: unknown) {
  if (typeof email !== 'string' || email.length < 3) {
    return `emails must be at least 3 characters long`;
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== 'string' || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

function validateUrl(url: string) {
  let urls = ['/', '/', 'https://remix.run'];
  if (urls.includes(url)) {
    return url;
  }
  return '/';
}

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();
  const loginType = form.get('loginType');
  const email = form.get('email');
  const password = form.get('password');
  const redirectTo = validateUrl((form.get('redirectTo') as string) || '/');
  if (
    typeof loginType !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof redirectTo !== 'string'
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: `Form not submitted correctly.`,
    });
  }

  const fields = { loginType, email, password };
  const fieldErrors = {
    email: validateemail(email),
    password: validatePassword(password),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  switch (loginType) {
    case 'login': {
      const user = await login({ email, password });
      console.log({ user });
      if (!user) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError: `Username/Password combination is incorrect`,
        });
      }
      // if there is a user, create their session and redirect to /
      return createUserSession(user.id, redirectTo);
    }
    case 'register': {
      const userExists = await keystoneContext.sudo().db.User.findOne({
        where: { email },
      });
      if (userExists) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError: `Cannot create a user with that email address`,
        });
      }
      // create the user
      const user = await keystoneContext.sudo().db.User.createOne({
        data: {
          email,
          password,
        },
      });
      // if there is a user, create their session and redirect to /
      if (!user) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError: `Cannot create a user with that email address`,
        });
      }
      // create their session and redirect to /
      return createUserSession(user.id, redirectTo);
    }
    default: {
      return badRequest({
        fieldErrors: null,
        fields,
        formError: `Login type invalid`,
      });
    }
  }
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>Login</h1>
        <form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={searchParams.get('redirectTo') ?? undefined}
          />
          <fieldset>
            <legend className="sr-only">Login or Register?</legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked={
                  !actionData?.fields?.loginType || actionData?.fields?.loginType === 'login'
                }
              />{' '}
              Login
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
                defaultChecked={actionData?.fields?.loginType === 'register'}
              />{' '}
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor="email-input">email</label>
            <input
              type="text"
              id="email-input"
              name="email"
              defaultValue={actionData?.fields?.email}
              aria-invalid={Boolean(actionData?.fieldErrors?.email)}
              aria-errormessage={actionData?.fieldErrors?.email ? 'email-error' : undefined}
            />
            {actionData?.fieldErrors?.email ? (
              <p className="form-validation-error" role="alert" id="email-error">
                {actionData.fieldErrors.email}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              name="password"
              type="password"
              defaultValue={actionData?.fields?.password}
              aria-invalid={Boolean(actionData?.fieldErrors?.password)}
              aria-errormessage={actionData?.fieldErrors?.password ? 'password-error' : undefined}
            />
            {actionData?.fieldErrors?.password ? (
              <p className="form-validation-error" role="alert" id="password-error">
                {actionData.fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div id="form-error-message">
            {actionData?.formError ? (
              <p className="form-validation-error" role="alert">
                {actionData.formError}
              </p>
            ) : null}
          </div>
          <button type="submit" className="button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
