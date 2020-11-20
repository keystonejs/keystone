/** @jsx jsx */

import { jsx, Stack } from '@keystone-ui/core';
import { useState } from 'react';
import { DateInput, DatePicker, ISODate } from '@keystone-ui/date-fields';

import { Page } from '../../components/Page';

const BasicDateInput = () => {
  let [value, setValue] = useState<undefined | ISODate>();
  return <DateInput value={value} onChange={setValue} />;
};

const BasicDatePicker = () => {
  let [value, setValue] = useState<undefined | ISODate>(undefined);
  return (
    <Stack gap="small">
      <pre>{value || 'no value'}</pre>
      <DatePicker onChange={setValue} onClear={() => setValue(undefined)} value={value} />
    </Stack>
  );
};

export default function DateFieldPage() {
  return (
    <Page>
      <h1>Date Fields</h1>
      <Stack across gap="medium" align="center">
        <h2>Date Input</h2>
        <Stack gap="small">
          <BasicDateInput />
        </Stack>
      </Stack>
      <Stack across gap="medium" align="center">
        <h2>Date Picker</h2>
        <Stack gap="small">
          <BasicDatePicker />
        </Stack>
      </Stack>
    </Page>
  );
}
