import { useToasts } from '@keystone-ui/toast';
import { ComponentProps, useState, useMemo, useRef, useEffect, useCallback } from 'react';
import isDeepEqual from 'fast-deep-equal';
import { useMutation, gql, ApolloError } from '../apollo';
import { useKeystone } from '..';
import { ListMeta } from '../../types';
import { usePreventNavigation } from './usePreventNavigation';
import { Fields, Value } from '.';

type ValueWithoutServerSideErrors = { [key: string]: { kind: 'value'; value: any } };

type CreateItemHookResult = {
  state: 'editing' | 'loading' | 'created';
  shouldPreventNavigation: boolean;
  error?: ApolloError;
  props: ComponentProps<typeof Fields>;
  create: () => Promise<{ id: string; label: string | null } | undefined>;
};

export function useCreateItem(list: ListMeta): CreateItemHookResult {
  const toasts = useToasts();
  const { createViewFieldModes } = useKeystone();

  const [createItem, { loading, error, data: returnedData }] = useMutation(
    gql`mutation($data: ${list.gqlNames.createInputName}!) {
      item: ${list.gqlNames.createMutationName}(data: $data) {
        id
        label: ${list.labelField}
    }
  }`
  );

  const [value, setValue] = useState(() => {
    const value: ValueWithoutServerSideErrors = {};
    Object.keys(list.fields).forEach(fieldPath => {
      value[fieldPath] = { kind: 'value', value: list.fields[fieldPath].controller.defaultValue };
    });
    return value;
  });

  const invalidFields = useMemo(() => {
    const invalidFields = new Set<string>();

    Object.keys(value).forEach(fieldPath => {
      const val = value[fieldPath].value;

      const validateFn = list.fields[fieldPath].controller.validate;
      if (validateFn) {
        const result = validateFn(val);
        if (result === false) {
          invalidFields.add(fieldPath);
        }
      }
    });
    return invalidFields;
  }, [list, value]);

  const [forceValidation, setForceValidation] = useState(false);

  const data: Record<string, any> = {};
  Object.keys(list.fields).forEach(fieldPath => {
    const { controller } = list.fields[fieldPath];
    const serialized = controller.serialize(value[fieldPath].value);
    if (!isDeepEqual(serialized, controller.serialize(controller.defaultValue))) {
      Object.assign(data, serialized);
    }
  });

  const shouldPreventNavigation = !returnedData?.item && Object.keys(data).length !== 0;

  const shouldPreventNavigationRef = useRef(shouldPreventNavigation);

  useEffect(() => {
    shouldPreventNavigationRef.current = shouldPreventNavigation;
  }, [shouldPreventNavigation]);

  usePreventNavigation(shouldPreventNavigationRef);

  return {
    state: loading ? 'loading' : !returnedData?.item ? 'created' : 'editing',
    shouldPreventNavigation,
    error,
    props: {
      fields: list.fields,
      fieldModes:
        createViewFieldModes.state === 'loaded' ? createViewFieldModes.lists[list.key] : null,
      forceValidation,
      invalidFields,
      value,
      onChange: useCallback((getNewValue: (value: Value) => Value) => {
        setValue(oldValues => getNewValue(oldValues) as ValueWithoutServerSideErrors);
      }, []),
    },
    async create(): Promise<{ id: string; label: string | null } | undefined> {
      const newForceValidation = invalidFields.size !== 0;
      setForceValidation(newForceValidation);

      if (newForceValidation) return undefined;

      let outputData: { item: { id: string; label: string | null } };
      try {
        outputData = await createItem({
          variables: {
            data,
          },
        }).then(x => x.data);
      } catch {
        return undefined;
      }
      shouldPreventNavigationRef.current = false;
      const label = outputData.item.label || outputData.item.id;
      toasts.addToast({
        title: label,
        message: 'Created Successfully',
        tone: 'positive',
      });
      return outputData.item;
    },
  };
}
