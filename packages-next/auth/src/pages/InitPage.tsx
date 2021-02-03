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

const Welcome = ({ value }: { value: any }) => {
  const [subscribe, setSubscribe] = useState(true);
  const [email, setEmail] = useState(guessEmailFromValue(value));
  const router = useRouter();
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (subscribe && email) {
      // ADD MAILCHIMP INTEGRATION HERE
    }
    router.push((router.query.from as string | undefined) || '/');
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
    if (rawKeystone.authenticatedItem.state === 'authenticated') {
      if (enableWelcome) {
        setMode('welcome');
      } else {
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

          setMode('welcome');
          return;

          const newForceValidation = invalidFields.size !== 0;
          setForceValidation(newForceValidation);

          if (newForceValidation) return;
          const data: Record<string, any> = {};
          const allSerializedValues = serializeValueToObjByFieldKey(fields, value);
          Object.keys(allSerializedValues).forEach(fieldPath => {
            const { controller } = fields[fieldPath];
            const serialized = allSerializedValues[fieldPath];
            if (!isDeepEqual(serialized, controller.serialize(controller.defaultValue))) {
              Object.assign(data, serialized);
            }
          });
          createFirstItem({
            variables: {
              data,
            },
          })
            .then(() => {
              reinitContext();
              router.push('/');
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
