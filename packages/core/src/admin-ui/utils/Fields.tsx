/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, Stack } from '@keystone-ui/core';
import { memo, useMemo } from 'react';
import { FieldMeta } from '../../types';
import { Value } from '.';

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
  fieldModes?: Record<string, 'hidden' | 'edit' | 'read'> | null;
  fieldPositions?: Record<string, 'form' | 'sidebar'> | null;
  forceValidation: boolean;
  position?: 'form' | 'sidebar';
  invalidFields: ReadonlySet<string>;
  onChange(value: (value: Value) => Value): void;
};

export function Fields({
  fields,
  value,
  fieldModes = null,
  fieldPositions = null,
  forceValidation,
  invalidFields,
  position = 'form',
  onChange,
}: FieldsProps) {
  const renderedFields = Object.keys(fields)
    .map((fieldPath, index) => {
      const field = fields[fieldPath];
      const val = value[fieldPath];
      const fieldMode = fieldModes === null ? 'edit' : fieldModes[fieldPath];
      const fieldPosition = fieldPositions === null ? 'form' : fieldPositions[fieldPath];

      if (fieldMode === 'hidden') return null;
      if (fieldPosition !== position) return null;
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
    })
    .filter(Boolean);

  return (
    <Stack gap="xlarge">
      {renderedFields}
      {renderedFields.length === 0 && 'There are no fields that you can read or edit'}
    </Stack>
  );
}
