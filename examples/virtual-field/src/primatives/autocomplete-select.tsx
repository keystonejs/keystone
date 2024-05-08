/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { useState, type KeyboardEventHandler } from 'react';
import { DocumentNode, useQuery } from '@keystone-6/core/admin-ui/apollo';
import { Select } from '@keystone-ui/fields';
import { Item } from '.';

export type SelectProps = {
  gql: DocumentNode;
  onChange: (item: Item) => void;
}

export const AutocompleteSelect = (props: SelectProps) => {
  // Queries
  const [inputValue, setInputValue] = useState<string>("");
  const { data, loading } = useQuery<{ tags: any[] }>(props.gql, {
    variables: { where: { title: { startsWith: inputValue } } },
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
          data.tags
            .map((v) => ({ value: v.id, label: v.label }))
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