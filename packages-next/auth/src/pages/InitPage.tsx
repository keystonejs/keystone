/* @jsx jsx */

import { useEffect, useMemo, useState } from 'react';

import { jsx, H1, Stack } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
import { Checkbox, TextInput } from '@keystone-ui/fields';
import { useRawKeystone } from '@keystone-next/admin-ui/context';
import { FieldMeta } from '@keystone-next/types';
import isDeepEqual from 'fast-deep-equal';

import { SigninContainer } from '../components/SigninContainer';
import { gql, useMutation } from '@keystone-next/admin-ui/apollo';
import { useReinitContext, useKeystone } from '@keystone-next/admin-ui/context';
import { useRouter } from '@keystone-next/admin-ui/router';
import { GraphQLErrorNotice } from '@keystone-next/admin-ui/components';
import {
  Fields,
  serializeValueToObjByFieldKey,
  useInvalidFields,
} from '@keystone-next/admin-ui-utils';

const emailKeysToGuess = ['email', 'username'];

const guessEmailFromValue = (value: any) => {
  for (const key of emailKeysToGuess) {
    if (value[key] && typeof value[key].value === 'string') {
      return value[key].value;
    }
  }
};

// email validation regex from https://html.spec.whatwg.org/multipage/input.html#email-state-(type=email)
const validEmail = (email: string) =>
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
    email
  );

const Welcome = ({ value }: { value: any }) => {
  const [subscribe, setSubscribe] = useState<boolean>(true);
  const [email, setEmail] = useState<string>(guessEmailFromValue(value));
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    // Check if user wants to subscribe.
    // and there's a valid email address.
    if (subscribe) {
      // Basic validation check on the email?
      if (validEmail(email)) {
        // if good add email to mailing list
        // and redirect to dashboard.
      } else {
        // if bad set error message
        setError('Email is invalid');
        return;
      }
    }
    return router.push((router.query.from as string | undefined) || '/');
  };
  return (
    <form onSubmit={onSubmit}>
      <Stack gap="medium">
        <H1>Welcome to KeystoneJS</H1>
        <div>Next up: star the project, follow us on twitter for updates</div>
        <div>
          <Checkbox checked={subscribe} onChange={() => setSubscribe(!subscribe)}>
            sign up to our mailing list
          </Checkbox>
        </div>
        {subscribe ? (
          <div>
            <TextInput autoFocus value={email} onChange={e => setEmail(e.target.value)} />
            <p css={{ color: 'red' }}>{error}</p>
          </div>
        ) : null}
        <div>
          <Button type="submit" weight="bold" tone="active">
            Get started
          </Button>
        </div>
      </Stack>
    </form>
  );
};

export const InitPage = ({
  fieldPaths,
  listKey,
  enableWelcome,
}: {
  listKey: string;
  fieldPaths: string[];
  enableWelcome: boolean;
}) => {
  const { adminMeta } = useKeystone();
  const fields = useMemo(() => {
    const fields: Record<string, FieldMeta> = {};
    fieldPaths.forEach(fieldPath => {
      fields[fieldPath] = adminMeta.lists[listKey].fields[fieldPath];
    });
    return fields;
  }, [fieldPaths]);

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

  const [
    createFirstItem,
    { loading, error, data },
  ] = useMutation(gql`mutation($data: CreateInitial${listKey}Input!) {
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
  }, [rawKeystone.authenticatedItem, router.query.from]);

  return mode === 'init' ? (
    <SigninContainer>
      <H1>Welcome to KeystoneJS</H1>
      <p>Get Started by creating the first user:</p>
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

          // Create the first item in the database.
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
