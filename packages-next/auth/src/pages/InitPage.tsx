/* @jsx jsx */

import { useEffect, useMemo, useState } from 'react';

import { jsx, H1, Stack } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
import { useRawKeystone } from '@keystone-next/admin-ui/context';
import { FieldMeta, FieldViews, SerializedFieldMeta } from '@keystone-next/types';
import isDeepEqual from 'fast-deep-equal';

import { SigninContainer } from '../components/SigninContainer';
import { gql, useMutation } from '@keystone-next/admin-ui/apollo';
import { useReinitContext } from '@keystone-next/admin-ui/context';
import { useRouter } from '@keystone-next/admin-ui/router';
import { GraphQLErrorNotice } from '@keystone-next/admin-ui/components';
import {
  Fields,
  serializeValueToObjByFieldKey,
  useInvalidFields,
} from '@keystone-next/admin-ui-utils';

export const InitPage = ({
  fields: serializedFields,
  listKey,
}: {
  listKey: string;
  fields: Record<string, SerializedFieldMeta>;
  showKeystoneSignup: boolean;
}) => {
  const { fieldViews } = useRawKeystone();
  const fields = useMemo(() => {
    const fields: Record<string, FieldMeta> = {};
    Object.keys(serializedFields).forEach(fieldPath => {
      // note that we're skipping the validation since we don't know the list key and
      // the validation will happen after the user has the created the initial item anyway
      const field = serializedFields[fieldPath];
      const views = fieldViews[field.viewsIndex];
      const customViews: Record<string, any> = {};
      if (field.customViews !== null) {
        const customViewsSource: FieldViews[number] & Record<string, any> =
          fieldViews[field.customViews];
        const allowedExportsOnCustomViews = new Set(views.allowedExportsOnCustomViews);
        Object.keys(customViewsSource).forEach(exportName => {
          if (allowedExportsOnCustomViews.has(exportName)) {
            customViews[exportName] = customViewsSource[exportName];
          } else {
            (views as any)[exportName] = customViewsSource[exportName];
          }
        });
      }
      fields[fieldPath] = {
        ...field,
        path: fieldPath,
        views,
        controller: fieldViews[field.viewsIndex].controller({
          listKey,
          fieldMeta: field.fieldMeta,
          label: field.label,
          path: fieldPath,
          customViews,
        }),
      };
    });
    return fields;
  }, [serializedFields]);

  const [value, setValue] = useState(() => {
    let state: Record<string, any> = {};
    Object.keys(fields).forEach(fieldPath => {
      state[fieldPath] = { kind: 'value', value: fields[fieldPath].controller.defaultValue };
    });
    return state;
  });

  const invalidFields = useInvalidFields(fields, value);

  const [forceValidation, setForceValidation] = useState(false);

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
      router.push((router.query.from as string | undefined) || '/');
    }
  }, [rawKeystone.authenticatedItem, router.query.from]);

  return (
    <SigninContainer>
      <H1>Welcome to KeystoneJS</H1>
      <p>Get Started by creating the first user:</p>
      <form
        onSubmit={event => {
          event.preventDefault();
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
  );
};
