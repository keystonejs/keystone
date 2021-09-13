/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { Options, CheckMark } from '@keystone-ui/options';
import { ComponentProps, useState } from 'react';

import { Page } from '../../components/Page';

const props: ComponentProps<typeof CheckMark>[] = [
  {},
  { isDisabled: true },
  { isFocused: true },
  { isDisabled: true, isSelected: true },
  { isFocused: true, isSelected: true },
  { isSelected: true },
];

export default function OptionsPage() {
  let [value, setValue] = useState<undefined | { label: string; value: string }>();
  return (
    <Page>
      <h1>Options</h1>
      <Options
        value={value}
        onChange={value => {
          console.log(value);
          setValue(value as { label: string; value: string });
        }}
        options={[
          {
            label: 'Option A',
            value: 'a',
          },
          {
            label: 'Option B',
            value: 'b',
          },
          {
            label: 'Option C',
            value: 'c',
          },
          {
            label: 'Option D',
            value: 'd',
          },
          {
            label: 'Option E',
            value: 'e',
          },
          {
            label: 'Option F',
            value: 'f',
          },
        ]}
      />
      <h1>CheckMark</h1>
      {props.map(props => (
        <div>
          {JSON.stringify(props)}
          <CheckMark {...props} />
        </div>
      ))}
    </Page>
  );
}
