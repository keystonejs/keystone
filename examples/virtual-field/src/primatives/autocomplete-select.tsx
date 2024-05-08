/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { useState, type KeyboardEventHandler } from 'react';
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo';
import { Select } from '@keystone-ui/fields';
import { Item } from '.';
import { useKeystone } from '@keystone-6/core/admin-ui/context';

export type SelectProps = {
  listKey: string;
  fieldPath: string;
  onChange: (item: Item) => void;
  ignoreValues?: string[];
}

export const AutocompleteSelect = (props: SelectProps) => {
  // Keystone
  const keystone = useKeystone()
  const list = keystone.adminMeta.lists[props.listKey]

  // Queries
  const [inputValue, setInputValue] = useState<string>("");
  const whereInput = list.gqlNames.whereInputName
  const listQuery = list.gqlNames.listQueryName

  const { data, loading } = useQuery(gql`
    query Asdf($where: ${whereInput}!) {
      ${listQuery}(where: $where) {
        id
        ${props.fieldPath}
      }
    }
  `, {
    variables: {
      where: {
        AND: [
          { [props.fieldPath]: { startsWith: inputValue } },
          { [props.fieldPath]: { notIn: props.ignoreValues } }
        ]
      },
    },
    skip: !inputValue,  // Only run the query after the input has a value
  });

  // Allows for entering a lable that does NOT already exist, after hitting the "enter" key
  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter" && inputValue) {
      props.onChange({ label: inputValue })
    }
  }
  const onChange = (value: Item | null) => {
    if (value) props.onChange(value)
  }

  return (
    <Select
      options={
        !data ?
          [] :
          data[listQuery]
            .map((v: any) => ({ value: v.id, label: v[props.fieldPath] }))
      }
      value={null}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onInputChange={(v) => setInputValue(v)}
      css={{ marginBottom: "12px" }}
      isLoading={loading}
    />
  )
}