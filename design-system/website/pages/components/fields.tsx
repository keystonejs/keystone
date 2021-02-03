/* @jsx jsx */

import { ComponentProps, ReactNode, useState } from 'react';
import { jsx, Stack, useTheme } from '@keystone-ui/core';
import {
  Checkbox,
  Radio,
  TextArea,
  TextInput,
  Switch,
  Select,
  DatePicker,
  DateType,
} from '@keystone-ui/fields';
import { SegmentedControl } from '@keystone-ui/segmented-control';

import { Page } from '../../components/Page';

const FieldWrapper = ({ children }: { children: ReactNode }) => {
  const { spacing } = useTheme();
  return (
    <div
      css={{
        marginTop: spacing.medium,
        marginBottom: spacing.medium,
      }}
    >
      {children}
    </div>
  );
};

const StatefulSwitch = ({ children, ...props }: ComponentProps<typeof Switch>) => {
  const [checked, setChecked] = useState(false);
  return (
    <Switch checked={checked} onClick={() => setChecked(!checked)} {...props}>
      {children}
    </Switch>
  );
};

const BasicDatePicker = () => {
  let [value, setValue] = useState<DateType>('');
  return (
    <Stack gap="small">
      <pre>{value || 'no value'}</pre>
      <DatePicker onUpdate={setValue} onClear={() => setValue('')} value={value} />
    </Stack>
  );
};

export default function FieldsPage() {
  const { spacing } = useTheme();
  const [selectVal, setSelectVal] = useState<{ label: string; value: string } | null>(null);
  return (
    <Page>
      <h1>Form Fields</h1>
      <h2>Text Inputs</h2>
      <FieldWrapper>
        <TextInput placeholder="Small" size="small" />
      </FieldWrapper>
      <FieldWrapper>
        <TextInput placeholder="Medium" size="medium" />
      </FieldWrapper>
      <FieldWrapper>
        <TextInput placeholder="Large" size="large" />
      </FieldWrapper>
      <h3>Disabled</h3>
      <FieldWrapper>
        <TextInput value="This one is disabled" size="medium" disabled />
      </FieldWrapper>
      <h2>TextAreas</h2>
      <FieldWrapper>
        <TextArea />
      </FieldWrapper>
      <h2>Select</h2>
      <FieldWrapper>
        <Select
          width="large"
          value={selectVal}
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
          onChange={setSelectVal as any}
        />
      </FieldWrapper>
      <h2>Segmented Controls</h2>
      <FieldWrapper>
        <SegmentedControl animate segments={['one', 'two', 'three']} />
      </FieldWrapper>
      <h2>Checkboxes</h2>
      <FieldWrapper>
        <Checkbox css={{ marginRight: spacing.medium }}>Check Me</Checkbox>
        <Checkbox css={{ marginRight: spacing.medium }} checked readOnly>
          Always Checked
        </Checkbox>
        <Checkbox css={{ marginRight: spacing.medium }} disabled readOnly>
          Disabled Option
        </Checkbox>
        <Checkbox css={{ marginRight: spacing.medium }} disabled checked readOnly>
          Checked + Disabled
        </Checkbox>
      </FieldWrapper>
      <h3>Sizes</h3>
      <FieldWrapper>
        <Checkbox css={{ marginRight: spacing.medium }} size="small">
          Small
        </Checkbox>
        <Checkbox css={{ marginRight: spacing.medium }} size="medium">
          Medium
        </Checkbox>
        <Checkbox css={{ marginRight: spacing.medium }} size="large">
          Large
        </Checkbox>
      </FieldWrapper>
      <h2>Radio Buttons</h2>
      <FieldWrapper>
        <Radio name="radio-set" css={{ marginRight: spacing.medium }}>
          Check Me
        </Radio>
        <Radio name="radio-set" css={{ marginRight: spacing.medium }}>
          Or Me
        </Radio>
        <Radio css={{ marginRight: spacing.medium }} checked readOnly>
          Always Checked
        </Radio>
        <Radio css={{ marginRight: spacing.medium }} disabled readOnly>
          Disabled
        </Radio>
        <Radio css={{ marginRight: spacing.medium }} disabled checked readOnly>
          Checked + Disabled
        </Radio>
      </FieldWrapper>
      <h3>Sizes</h3>
      <FieldWrapper>
        <Radio name="radio-size-set" css={{ marginRight: spacing.medium }} size="small">
          Small
        </Radio>
        <Radio name="radio-size-set" css={{ marginRight: spacing.medium }} size="medium">
          Medium
        </Radio>
        <Radio name="radio-size-set" css={{ marginRight: spacing.medium }} size="large">
          Large
        </Radio>
      </FieldWrapper>
      <h2>Switches</h2>
      <FieldWrapper>
        <StatefulSwitch css={{ marginRight: spacing.medium }}>Switch Me</StatefulSwitch>
        <Switch css={{ marginRight: spacing.medium }} checked>
          Always On
        </Switch>
        <Switch css={{ marginRight: spacing.medium }} checked disabled>
          On + Disabled
        </Switch>
      </FieldWrapper>
      <h2>Date Picker</h2>
      <FieldWrapper>
        <BasicDatePicker />
      </FieldWrapper>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
    </Page>
  );
}
