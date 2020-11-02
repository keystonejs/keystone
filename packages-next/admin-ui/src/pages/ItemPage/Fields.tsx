/** @jsx jsx */
import { jsx } from '@keystone-ui/core';
import { FieldMeta } from '@keystone-next/types';
import { GraphQLError } from 'graphql';
import { Fragment } from 'react';

type Value = Record<
  string,
  | {
      kind: 'error';
      errors: readonly [GraphQLError, ...GraphQLError[]];
    }
  | {
      kind: 'value';
      value: any;
    }
>;

type FieldsProps = {
  fields: Record<string, FieldMeta>;
  value: Value;
  forceValidation: boolean;
  invalidFields: ReadonlySet<string>;
  fieldModes: Record<string, 'hidden' | 'edit' | 'read'>;
  onChange(value: Value): void;
};

export function Fields({
  fields,
  value,
  fieldModes,
  forceValidation,
  invalidFields,
  onChange,
}: FieldsProps) {
  const renderedFields = Object.keys(fields)
    .filter(fieldPath => fieldModes[fieldPath] !== 'hidden')
    .map((fieldPath, index) => {
      const field = fields[fieldPath];
      const val = value[fieldPath];
      const fieldMode = fieldModes[fieldPath];

      if (val.kind === 'error') {
        return (
          <div>
            {field.label}: <span css={{ color: 'red' }}>{val.errors[0].message}</span>
          </div>
        );
      }
      return (
        <field.views.Field
          key={fieldPath}
          field={field.controller}
          value={val.value}
          forceValidation={forceValidation && invalidFields.has(fieldPath)}
          onChange={
            fieldMode === 'edit'
              ? fieldValue => {
                  onChange({
                    ...value,
                    [fieldPath]: { kind: 'value', value: fieldValue },
                  });
                }
              : undefined
          }
          autoFocus={index === 0}
        />
      );
    });
  return (
    <Fragment>
      {renderedFields}
      {renderedFields.length === 0 && 'There are no fields that you can read or edit'}
    </Fragment>
  );
}
