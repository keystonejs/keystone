/* @jsx jsx */

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

import { jsx, H1 } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
import { useRawKeystone } from '@keystone-spike/admin-ui';
import { FieldMeta, SerializedFieldMeta } from '@keystone-spike/types';

import { SigninContainer } from '../components/SigninContainer';
import { DocumentNode } from 'graphql';
import { Notice } from '@keystone-ui/notice';
import { useMutation } from '@keystone-spike/admin-ui/apollo';
import { useReinitContext } from '@keystone-spike/admin-ui/context';
import { useRouter } from '@keystone-spike/admin-ui/router';

export const InitPage = ({
  fields: serializedFields,
  mutation,
}: {
  fields: Record<string, SerializedFieldMeta>;
  mutation: DocumentNode;
  showKeystoneSignup: boolean;
}) => {
  const { fieldViews } = useRawKeystone();
  const fields = useMemo(() => {
    const fields: Record<string, FieldMeta> = {};
    Object.keys(serializedFields).forEach(fieldPath => {
      const serializedField = serializedFields[fieldPath];
      const views = fieldViews[serializedField.views];

      fields[fieldPath] = {
        ...serializedField,
        views,
        controller: views.controller({
          path: fieldPath,
          label: serializedField.label,
          fieldMeta: serializedField.fieldMeta,
        }),
      };
    });
    return fields;
  }, [serializedFields]);

  const [state, setState] = useState(() => {
    let state: Record<string, any> = {};
    Object.keys(fields).forEach(fieldPath => {
      state[fieldPath] = fields[fieldPath].controller.defaultValue;
    });
    return state;
  });

  const [createFirstItem, { loading, error }] = useMutation(mutation);
  const reinitContext = useReinitContext();
  const router = useRouter();

  const nameInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  return (
    <SigninContainer>
      <H1>Welcome to KeystoneJS</H1>
      <p>Get Started by creating the first user:</p>
      <form
        onSubmit={async event => {
          event.preventDefault();
          await createFirstItem({
            variables: {
              data: Object.assign(
                {},
                ...Object.keys(fields).map(fieldKey =>
                  fields[fieldKey].controller.serialize(state[fieldKey])
                )
              ),
            },
          });
          reinitContext();
          await router.push('/');
        }}
      >
        {error && <Notice>{error.message}</Notice>}
        <Fragment>
          {Object.keys(fields).map(fieldPath => {
            const Field = fields[fieldPath].views.Field;
            return (
              <Field
                field={fields[fieldPath].controller}
                value={state[fieldPath]}
                onChange={value => {
                  setState({ ...state, [fieldPath]: value });
                }}
              />
            );
          })}
        </Fragment>

        <Button isLoading={loading} type="submit" weight="bold" tone="active">
          Get started
        </Button>
      </form>
    </SigninContainer>
  );
};
