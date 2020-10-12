/** @jsx jsx */
import { Button } from '@keystone-ui/button';
import { Box, jsx, useTheme } from '@keystone-ui/core';
import { ChevronDownIcon } from '@keystone-ui/icons/icons/ChevronDownIcon';
import { Options, OptionPrimitive, CheckMark } from '@keystone-ui/options';
import { Popover } from '@keystone-ui/popover';
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

let fieldSelectionOptionsComponents = { Option };

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
  const columnCount = selectedFields.fields.length + Number(selectedFields.includeLabel);
  const onlySingleFieldIsSelected = columnCount === 1;
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
  const fields = [
    {
      value: '_label_',
      label: 'Label',
      isDisabled: onlySingleFieldIsSelected && selectedFields.includeLabel,
    },
  ];
  Object.keys(fieldModesByFieldPath).forEach(fieldPath => {
    if (fieldModesByFieldPath[fieldPath] === 'read') {
      fields.push({
        value: fieldPath,
        label: list.fields[fieldPath].label,
        isDisabled: onlySingleFieldIsSelected && selectedFieldsSet.has(fieldPath),
      });
    }
  });

  const theme = useTheme();

  return (
    <Popover
      triggerRenderer={({ triggerProps }) => {
        return (
          <Button weight="link" {...triggerProps}>
            <span css={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
              {columnCount} column{columnCount === 1 ? '' : 's'}{' '}
              <ChevronDownIcon css={{ marginLeft: theme.spacing.xsmall }} size="smallish" />
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
              return option.value === '_label_'
                ? selectedFields.includeLabel
                : selectedFieldsSet.has(option.value);
            })}
            options={fields}
            components={fieldSelectionOptionsComponents}
          />
        </Box>
      </div>
    </Popover>
  );
}
