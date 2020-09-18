/* @jsx jsx */

import { ReactNode, useState } from 'react';
import { jsx } from '@emotion/core';
import { useTheme } from '@keystone-ui/core';
import { Checkbox, Radio, TextArea, TextInput, Switch } from '@keystone-ui/fields';
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

const StatefulSwitch = ({ children, ...props }: { children: ReactNode }) => {
  const [checked, setChecked] = useState(false);
  return (
    <Switch checked={checked} onClick={() => setChecked(!checked)} {...props}>
      {children}
    </Switch>
  );
};

export default function FieldsPage() {
  const { spacing } = useTheme();
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
    </Page>
  );
}
