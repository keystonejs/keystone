import { JSONValue, FieldMeta } from '@keystone-next/types';
import { GraphQLError } from 'graphql';
import { DataGetter } from './dataGetter';
import { getRootGraphQLFieldsFromFieldController } from './getRootGraphQLFieldsFromFieldController';

export type ItemData = { id: string; [key: string]: any };

export type DeserializedValue = Record<
  string,
  | { kind: 'error'; errors: readonly [GraphQLError, ...GraphQLError[]] }
  | { kind: 'value'; value: any }
>;

export function deserializeValue(
  fields: Record<string, FieldMeta>,
  itemGetter: DataGetter<ItemData>
) {
  const value: DeserializedValue = {};
  Object.keys(fields).forEach(fieldKey => {
    const field = fields[fieldKey];
    const itemForField: Record<string, any> = {};
    const errors = new Set<GraphQLError>();
    for (const graphqlField of getRootGraphQLFieldsFromFieldController(field.controller)) {
      const fieldGetter = itemGetter.get(graphqlField);
      if (fieldGetter.errors) {
        fieldGetter.errors.forEach(error => {
          errors.add(error);
        });
      }
      itemForField[graphqlField] = fieldGetter.data;
    }
    if (errors.size) {
      value[fieldKey] = { kind: 'error', errors: [...errors] as any };
    } else {
      value[fieldKey] = { kind: 'value', value: field.controller.deserialize(itemForField) };
    }
  });
  return value;
}

export function serializeValueToObjByFieldKey(
  fields: Record<string, FieldMeta>,
  value: DeserializedValue
) {
  const obj: Record<string, Record<string, JSONValue>> = {};
  Object.keys(fields).map(fieldKey => {
    const val = value[fieldKey];
    if (val.kind === 'value') {
      obj[fieldKey] = fields[fieldKey].controller.serialize(val.value);
    }
  });
  return obj;
}
