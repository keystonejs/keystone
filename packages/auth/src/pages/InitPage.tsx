/** @jsxRuntime classic */
/** @jsx jsx */

import { useEffect, useMemo, useState } from 'react';
import fetch from 'cross-fetch';

import { jsx, H1, Stack, Inline, VisuallyHidden, Center } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
import { Checkbox, TextInput } from '@keystone-ui/fields';
import { useRawKeystone } from '@keystone-6/core/admin-ui/context';
import { FieldMeta } from '@keystone-6/core/types';
import isDeepEqual from 'fast-deep-equal';

import { gql, useMutation } from '@keystone-6/core/admin-ui/apollo';
import { useReinitContext, useKeystone } from '@keystone-6/core/admin-ui/context';
import { useRouter, Link } from '@keystone-6/core/admin-ui/router';
import { GraphQLErrorNotice } from '@keystone-6/core/admin-ui/components';
import {
  Fields,
  serializeValueToObjByFieldKey,
  useInvalidFields,
} from '@keystone-6/core/admin-ui/utils';
import { LoadingDots } from '@keystone-ui/loading';
import { guessEmailFromValue, validEmail } from '../lib/emailHeuristics';
import { IconTwitter, IconGithub } from '../components/Icons';
import { SigninContainer } from '../components/SigninContainer';

const signupURL = 'https://signup.keystonejs.cloud/api/newsletter-signup';

const Welcome = ({ value }: { value: any }) => {
  const [subscribe, setSubscribe] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(guessEmailFromValue(value));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    // Check if user wants to subscribe.
    // and there's a valid email address.
    if (subscribe) {
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
            name: value.username,
            email,
            source: '@keystone-6/auth InitPage',
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
              router.push((router.query.from as string | undefined) || '/');
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
    }
    return router.push((router.query.from as string | undefined) || '/');
  };
  return (
    <Stack gap="large">
      <Stack
        gap="small"
        align="center"
        across
        css={{
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <H1>Welcome</H1>
        <Stack across gap="small">
          <IconTwitter title="Twitter Logo" />
          <IconGithub
            href="https://github.com/keystonejs/keystone"
            target="_blank"
            title="Github"
          />
        </Stack>
      </Stack>

      <p css={{ margin: 0 }}>
        Thanks for installing KeystoneJS. While you're getting started, check out the docs at{' '}
        <a href="https://keystonejs.com">keystonejs.com</a>
      </p>
      <div>
        If you'd like to stay up to date with the exciting things we have planned, join our mailing
        list (just useful announcements, no spam!)
      </div>
      <div>
        <Checkbox
          checked={subscribe}
          onChange={() => {
            setError(null);
            setSubscribe(!subscribe);
          }}
        >
          sign up to our mailing list
        </Checkbox>
      </div>
      <form onSubmit={onSubmit}>
        <VisuallyHidden as="label" htmlFor="email-field">
          Email Address
        </VisuallyHidden>
        <TextInput
          id="email-field"
          disabled={!subscribe}
          autoFocus
          placeholder={'Email'}
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
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
    </Stack>
  );
};

type InitPageProps = {
  listKey: string;
  fieldPaths: string[];
  enableWelcome: boolean;
};

export const getInitPage = (props: InitPageProps) => () => <InitPage {...props} />;

const InitPage = ({ fieldPaths, listKey, enableWelcome }: InitPageProps) => {
  const { adminMeta } = useKeystone();
  const fields = useMemo(() => {
    const fields: Record<string, FieldMeta> = {};
    fieldPaths.forEach(fieldPath => {
      fields[fieldPath] = adminMeta.lists[listKey].fields[fieldPath];
    });
    return fields;
  }, [fieldPaths, adminMeta.lists, listKey]);

  const [value, setValue] = useState(() => {
    let state: Record<string, any> = {};
    Object.keys(fields).forEach(fieldPath => {
      state[fieldPath] = { kind: 'value', value: fields[fieldPath].controller.defaultValue };
    });
    return state;
  });

  const invalidFields = useInvalidFields(fields, value);

  const [forceValidation, setForceValidation] = useState(false);

  const [mode, setMode] = useState<'init' | 'welcome'>('init');

  const [createFirstItem, { loading, error, data }] =
    useMutation(gql`mutation($data: CreateInitial${listKey}Input!) {
    authenticate: createInitial${listKey}(data: $data) {
      ... on ${listKey}AuthenticationWithPasswordSuccess {
        item {
          id
        }
      }
    }
  }`);
  const reinitContext = useReinitContext();
  const router = useRouter();
  const rawKeystone = useRawKeystone();

  useEffect(() => {
    // This effect handles both cases:
    // a ) Our form submission is complete with new data
    // b ) User lands in init page due to a client side SPA redirect
    // Either way we check for an authenticated item
    if (rawKeystone.authenticatedItem.state === 'authenticated') {
      // If it exists we then check if enableWelcome is true
      // if it is then we set the mode to welcome first.
      // To tell the component to render the Welcome screen
      if (enableWelcome) {
        setMode('welcome');
      } else {
        // otherwise we route them through to the admin dashboard
        router.push((router.query.from as string | undefined) || '/');
      }
    }
  }, [rawKeystone.authenticatedItem, enableWelcome, router]);

  if (rawKeystone.authenticatedItem.state === 'authenticated' && !enableWelcome) {
    return (
      <Center fillView>
        <LoadingDots label="Loading page" size="large" />
      </Center>
    );
  }

  return mode === 'init' ? (
    <SigninContainer>
      <H1>Welcome to KeystoneJS</H1>
      <p>Create your first user to get started</p>
      <form
        onSubmit={event => {
          event.preventDefault();
          // Check if there are any invalidFields
          const newForceValidation = invalidFields.size !== 0;
          setForceValidation(newForceValidation);

          // if yes, don't submit the form
          if (newForceValidation) return;

          // If not we serialize the data
          const data: Record<string, any> = {};
          const allSerializedValues = serializeValueToObjByFieldKey(fields, value);
          Object.keys(allSerializedValues).forEach(fieldPath => {
            const { controller } = fields[fieldPath];
            const serialized = allSerializedValues[fieldPath];
            // we check the serialized values against the default values on the controller
            if (!isDeepEqual(serialized, controller.serialize(controller.defaultValue))) {
              // if they're different add them to the data object.
              Object.assign(data, serialized);
            }
          });

          // // Create the first item in the database.
          createFirstItem({
            variables: {
              data,
            },
          })
            .then(() => {
              // refetch admin meta
              reinitContext();
            })
            .catch(() => {});
        }}
      >
        <Stack gap="large">
          {error && (
            <GraphQLErrorNotice errors={error?.graphQLErrors} networkError={error?.networkError} />
          )}
          <Fields
            fields={fields}
            fieldModes={null}
            forceValidation={forceValidation}
            invalidFields={invalidFields}
            onChange={setValue}
            value={value}
          />
          <Button
            isLoading={
              loading ||
              data?.authenticate?.__typename === `${listKey}AuthenticationWithPasswordSuccess`
            }
            type="submit"
            weight="bold"
            tone="active"
          >
            Get started
          </Button>
        </Stack>
      </form>
    </SigninContainer>
  ) : (
    <SigninContainer>
      <Welcome value={value} />
    </SigninContainer>
  );
};
