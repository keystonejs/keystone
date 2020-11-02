/* @jsx jsx */

import { Fragment, useMemo, useState } from 'react';

import { jsx, H1 } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
import { useRawKeystone } from '@keystone-next/admin-ui';
import { FieldMeta, SerializedFieldMeta } from '@keystone-next/types';
import isDeepEqual from 'fast-deep-equal';

import { SigninContainer } from '../components/SigninContainer';
import { DocumentNode } from 'graphql';
import { useMutation } from '@keystone-next/admin-ui/apollo';
import { useReinitContext } from '@keystone-next/admin-ui/context';
import { useRouter } from '@keystone-next/admin-ui/router';
import { GraphQLErrorNotice } from '@keystone-next/admin-ui/components';

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
      // note that we're skipping the validation since we don't know the list key and
      // the validation will happen after the user has the created the initial item anyway
      const field = serializedFields[fieldPath];
      let views = fieldViews[field.views];
      if (field.customViews !== null) {
        views = {
          ...views,
          ...fieldViews[field.customViews],
        };
      }
      fields[fieldPath] = {
        ...field,
        views,
        controller: fieldViews[field.views].controller({
          fieldMeta: field.fieldMeta,
          label: field.label,
          path: fieldPath,
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

  const invalidFields = useMemo(() => {
    const invalidFields = new Set<string>();

    Object.keys(state).forEach(fieldPath => {
      const val = state[fieldPath];

      const validateFn = fields[fieldPath].controller.validate;
      if (validateFn) {
        const result = validateFn(val);
        if (result === false) {
          invalidFields.add(fieldPath);
        }
      }
    });
    return invalidFields;
  }, [fields, state]);

  const [forceValidation, setForceValidation] = useState(false);

  const [createFirstItem, { loading, error }] = useMutation(mutation);
  const reinitContext = useReinitContext();
  const router = useRouter();

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
          Object.keys(fields).forEach(fieldPath => {
            const { controller } = fields[fieldPath];
            const serialized = controller.serialize(state[fieldPath]);
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
        <GraphQLErrorNotice errors={error?.graphQLErrors} networkError={error?.networkError} />
        <Fragment>
          {Object.keys(fields).map((fieldPath, index) => {
            const Field = fields[fieldPath].views.Field;
            return (
              <Field
                field={fields[fieldPath].controller}
                value={state[fieldPath]}
                onChange={value => {
                  setState({ ...state, [fieldPath]: value });
                }}
                forceValidation={forceValidation && invalidFields.has(fieldPath)}
                autoFocus={index === 0}
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
