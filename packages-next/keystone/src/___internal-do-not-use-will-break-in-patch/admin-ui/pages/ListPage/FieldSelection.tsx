/** @jsx jsx */
import { ListMeta } from '@keystone-next/types';
import { Button } from '@keystone-ui/button';
import { Box, jsx } from '@keystone-ui/core';
import { ChevronDownIcon } from '@keystone-ui/icons/icons/ChevronDownIcon';
import { Options, OptionPrimitive, CheckMark } from '@keystone-ui/options';
import { Popover } from '@keystone-ui/popover';
import { useRouter } from 'next/router';
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

const Option: typeof OptionPrimitive = props => {
  return (
    <OptionPrimitive {...props}>
      {props.children}
      <CheckMark
        isDisabled={props.isDisabled}
        isFocused={props.isFocused}
        isSelected={props.isSelected}
      />
    </OptionPrimitive>
  );
};

export const fieldSelectionOptionsComponents = { Option };

export function FieldSelection({
  list,
  fieldModesByFieldPath,
}: {
  list: ListMeta;
  fieldModesByFieldPath: Record<string, 'hidden' | 'read'>;
}) {
  const router = useRouter();
  const selectedFields = useSelectedFields(list, fieldModesByFieldPath);

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
  const fields: { value: string; label: string; isDisabled: boolean }[] = [];
  Object.keys(fieldModesByFieldPath).forEach(fieldPath => {
    if (fieldModesByFieldPath[fieldPath] === 'read') {
      fields.push({
        value: fieldPath,
        label: list.fields[fieldPath].label,
        isDisabled: selectedFields.size === 1 && selectedFields.has(fieldPath),
      });
    }
  });

  return (
    <Popover
      triggerRenderer={({ triggerProps }) => {
        return (
          <Button weight="link" css={{ padding: 4 }} {...triggerProps}>
            <span css={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
              {selectedFields.size} column{selectedFields.size === 1 ? '' : 's'}{' '}
              <ChevronDownIcon size="smallish" />
            </span>
          </Button>
        );
      }}
    >
      <div css={{ width: 320 }}>
        <Box padding="medium">
          <Options
            onChange={options => {
              if (!Array.isArray(options)) return;
              setNewSelectedFields(options.map(x => x.value));
            }}
            isMulti
            value={fields.filter(option => {
              return selectedFields.has(option.value);
            })}
            options={fields}
            components={fieldSelectionOptionsComponents}
          />
        </Box>
      </div>
    </Popover>
  );
}
