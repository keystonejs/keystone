import { GraphQLError } from 'graphql';
import { useMemo } from 'react';
import isDeepEqual from 'fast-deep-equal';
import { FieldMeta } from '../../types';
import { ItemData, deserializeValue, serializeValueToObjByFieldKey } from './serialization';
import { DataGetter } from './dataGetter';

export type Value = Record<
  string,
  | { kind: 'error'; errors: readonly [GraphQLError, ...GraphQLError[]] }
  | { kind: 'value'; value: any }
>;

export function useChangedFieldsAndDataForUpdate(
  fields: Record<string, FieldMeta>,
  itemGetter: DataGetter<ItemData>,
  value: Value
) {
  const serializedValuesFromItem = useMemo(() => {
    const value = deserializeValue(fields, itemGetter);
    return serializeValueToObjByFieldKey(fields, value);
  }, [fields, itemGetter]);
  const serializedFieldValues = useMemo(() => {
    return serializeValueToObjByFieldKey(fields, value);
  }, [value, fields]);

  return useMemo(() => {
    let changedFields = new Set<string>();
    Object.keys(serializedFieldValues).forEach(fieldKey => {
      let isEqual = isDeepEqual(
        serializedFieldValues[fieldKey],
        serializedValuesFromItem[fieldKey]
      );
      if (!isEqual) {
        changedFields.add(fieldKey);
      }
    });
    const dataForUpdate: Record<string, any> = {};

    changedFields.forEach(fieldKey => {
      Object.assign(dataForUpdate, serializedFieldValues[fieldKey]);
    });
    return { changedFields: changedFields as ReadonlySet<string>, dataForUpdate };
  }, [serializedFieldValues, serializedValuesFromItem]);
}
