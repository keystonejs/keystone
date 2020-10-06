/** @jsx jsx */
import { jsx, Stack } from '@keystone-ui/core';
import { Checkbox } from '@keystone-ui/fields';
import { useRouter } from 'next/router';
import { useList } from '../../context';
import { useSelectedFields } from './useSelectedFields';

function isArrayEqual(arrA: string[], arrB: string[]) {
  if (arrA.length !== arrB.length) return false;
  for (let i = 0; i < arrA.length; i++) {
    if (arrA[i] !== arrB[i]) {
      return false;
    }
  }
  return true;
}

export function FieldSelection({
  listKey,
  fieldModesByFieldPath,
}: {
  listKey: string;
  fieldModesByFieldPath: Record<string, 'hidden' | 'read'>;
}) {
  const list = useList(listKey);
  const router = useRouter();
  const selectedFields = useSelectedFields(listKey, fieldModesByFieldPath);
  const onlySingleFieldIsSelected =
    selectedFields.fields.length + Number(selectedFields.includeLabel) === 1;
  const selectedFieldsSet = new Set(selectedFields.fields);

  const setNewSelectedFields = (selectedFields: string[]) => {
    if (isArrayEqual(selectedFields, list.initialColumns)) {
      const { fields: _ignore, ...otherQueryFields } = router.query;
      router.push({
        query: otherQueryFields,
      });
    } else {
      router.push({
        query: {
          ...router.query,
          fields: selectedFields.join(','),
        },
      });
    }
  };
  return (
    <fieldset>
      <Stack gap="small">
        <legend>Fields</legend>
        <Checkbox
          onChange={() => {
            const newSelectedFields = selectedFields.includeLabel
              ? selectedFields.fields
              : ['_label_'].concat(selectedFields.fields);

            setNewSelectedFields(newSelectedFields);
          }}
          disabled={onlySingleFieldIsSelected && selectedFields.includeLabel}
          checked={selectedFields.includeLabel}
        >
          Label
        </Checkbox>
        {Object.keys(fieldModesByFieldPath).map(fieldPath => {
          if (fieldModesByFieldPath[fieldPath] === 'hidden') {
            return null;
          }
          const checked = selectedFieldsSet.has(fieldPath);
          return (
            <Checkbox
              onChange={() => {
                const newSelectedFields = selectedFields.includeLabel ? ['_label_'] : [];
                Object.keys(list.fields).forEach(path => {
                  if (fieldPath === path) {
                    if (!checked) {
                      newSelectedFields.push(path);
                    }
                  } else if (selectedFieldsSet.has(path)) {
                    newSelectedFields.push(path);
                  }
                });
                setNewSelectedFields(newSelectedFields);
              }}
              disabled={onlySingleFieldIsSelected && checked}
              checked={checked}
            >
              {list.fields[fieldPath].label}
            </Checkbox>
          );
        })}
      </Stack>
    </fieldset>
  );
}
