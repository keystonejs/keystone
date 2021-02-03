/** @jsx jsx */
import { jsx, Stack } from '@keystone-ui/core';
import { FieldMeta } from '@keystone-next/types';
import { Value } from '.';
import { memo, useMemo } from 'react';

type RenderFieldProps = {
  field: FieldMeta;
  value: unknown;
  onChange?(value: (value: Value) => Value): void;
  autoFocus?: boolean;
  forceValidation?: boolean;
};

const RenderField = memo(function RenderField({
  field,
  value,
  autoFocus,
  forceValidation,
  onChange,
}: RenderFieldProps) {
  return (
    <field.views.Field
      field={field.controller}
      onChange={useMemo(() => {
        if (onChange === undefined) return undefined;
        return value => {
          onChange(val => ({ ...val, [field.controller.path]: { kind: 'value', value } }));
        };
      }, [onChange, field.controller.path])}
      value={value}
      autoFocus={autoFocus}
      forceValidation={forceValidation}
    />
  );
});

type FieldsProps = {
  fields: Record<string, FieldMeta>;
  value: Value;
  forceValidation: boolean;
  invalidFields: ReadonlySet<string>;
  fieldModes: Record<string, 'hidden' | 'edit' | 'read'> | null;
  onChange(value: (value: Value) => Value): void;
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
    .filter(fieldPath => fieldModes === null || fieldModes[fieldPath] !== 'hidden')
    .map((fieldPath, index) => {
      const field = fields[fieldPath];
      const val = value[fieldPath];
      const fieldMode = fieldModes === null ? 'edit' : fieldModes[fieldPath];

      if (val.kind === 'error') {
        return (
          <div>
            {field.label}: <span css={{ color: 'red' }}>{val.errors[0].message}</span>
          </div>
        );
      }
      return (
        <RenderField
          key={fieldPath}
          field={field}
          value={val.value}
          forceValidation={forceValidation && invalidFields.has(fieldPath)}
          onChange={fieldMode === 'edit' ? onChange : undefined}
          autoFocus={index === 0}
        />
      );
    });
  return (
    <Stack gap="xlarge">
      {renderedFields}
      {renderedFields.length === 0 && 'There are no fields that you can read or edit'}
    </Stack>
  );
}
