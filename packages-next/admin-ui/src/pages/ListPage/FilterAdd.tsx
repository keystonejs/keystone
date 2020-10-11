/** @jsx jsx */
import { FieldMeta, JSONValue } from '@keystone-spike/types';
import { Button } from '@keystone-ui/button';
import { jsx, Stack } from '@keystone-ui/core';
import { SelectInput } from '@keystone-ui/fields';
import { FormEvent, useMemo, useState } from 'react';
import { useList } from '../../context';
import { useRouter } from '../../router';

type State =
  | {
      kind: 'selecting-field';
    }
  | {
      kind: 'selecting-filter';
      fieldPath: string;
    }
  | {
      kind: 'filter-value';
      fieldPath: string;
      filterType: string;
      filterValue: JSONValue;
    };

export function FilterAdd({ listKey }: { listKey: string }) {
  const list = useList(listKey);
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: 'selecting-field' });
  const fieldsWithFilters = useMemo(() => {
    const fieldsWithFilters: Record<
      string,
      FieldMeta & { controller: { filter: NonNullable<FieldMeta['controller']['filter']> } }
    > = {};
    Object.keys(list.fields).forEach(fieldPath => {
      const field = list.fields[fieldPath];
      if (field.controller.filter) {
        // TODO: make all the things readonly so this works
        fieldsWithFilters[fieldPath] = field as any;
      }
    });
    return fieldsWithFilters;
  }, [list.fields]);
  const filtersByFieldThenType = useMemo(() => {
    const filtersByFieldThenType: Record<string, Record<string, string>> = {};
    Object.keys(fieldsWithFilters).forEach(fieldPath => {
      const field = fieldsWithFilters[fieldPath];
      let hasUnusedFilters = false;
      const filters: Record<string, string> = {};
      Object.keys(field.controller.filter.types).forEach(filterType => {
        if (router.query[`!${fieldPath}_${filterType}`] === undefined) {
          hasUnusedFilters = true;
          filters[filterType] = field.controller.filter.types[filterType].label;
        }
      });
      if (hasUnusedFilters) {
        filtersByFieldThenType[fieldPath] = filters;
      }
    });
    return filtersByFieldThenType;
  }, [router.query, fieldsWithFilters]);

  return (
    <Stack
      as="form"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        if (state.kind === 'filter-value') {
          router.push({
            query: {
              ...router.query,
              [`!${state.fieldPath}_${state.filterType}`]: JSON.stringify(state.filterValue),
            },
          });
          setState({
            kind: 'selecting-field',
          });
        }
      }}
      gap="small"
    >
      <label>
        Field to add filter for
        <SelectInput
          isClearable
          value={state.kind === 'selecting-field' ? undefined : state.fieldPath}
          onChange={newVal => {
            if (newVal === undefined) {
              setState({ kind: 'selecting-field' });
            } else {
              setState({ kind: 'selecting-filter', fieldPath: newVal });
            }
          }}
          options={Object.keys(filtersByFieldThenType).map(fieldPath => ({
            label: fieldsWithFilters[fieldPath].label,
            value: fieldPath,
          }))}
        />
      </label>
      {state.kind !== 'selecting-field' && (
        <label>
          Filter
          <SelectInput
            isClearable
            value={state.kind === 'selecting-filter' ? undefined : state.filterType}
            onChange={newVal => {
              if (newVal === undefined) {
                setState({ kind: 'selecting-filter', fieldPath: state.fieldPath });
              } else {
                setState({
                  kind: 'filter-value',
                  fieldPath: state.fieldPath,
                  filterValue:
                    fieldsWithFilters[state.fieldPath].controller.filter.types[newVal].initialValue,
                  filterType: newVal,
                });
              }
            }}
            options={Object.keys(filtersByFieldThenType[state.fieldPath]).map(filterType => ({
              label: filtersByFieldThenType[state.fieldPath][filterType],
              value: filterType,
            }))}
          />
        </label>
      )}
      {state.kind == 'filter-value' &&
        (() => {
          const { Filter } = fieldsWithFilters[state.fieldPath].controller.filter;
          return (
            <Filter
              type={state.filterType}
              value={state.filterValue}
              onChange={value => {
                setState(state => ({
                  ...state,
                  filterValue: value,
                }));
              }}
            />
          );
        })()}
      {state.kind == 'filter-value' && (
        <div css={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={() => {
              setState({
                kind: 'selecting-field',
              });
            }}
          >
            Cancel
          </Button>
          <Button type="submit">Add</Button>
        </div>
      )}
    </Stack>
  );
}
