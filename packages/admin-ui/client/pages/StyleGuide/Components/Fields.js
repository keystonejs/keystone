import React, { Fragment } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@voussoir/ui/src/primitives/fields';
import {
  Checkbox,
  CheckboxGroup,
  Input,
  RadioGroup,
  Radio,
  Select,
} from '@voussoir/ui/src/primitives/forms';
import { FlexGroup } from '@arch-ui/layout';

const FieldGuide = () => (
  <Fragment>
    <h2>Forms</h2>
    <h4>Input</h4>
    <FlexGroup isVertical>
      <Input placeholder="Input field" />
      <Input isMultiline placeholder="Textarea field" />
      <Select options={[{ label: 'Select Field', value: 'react-select' }]} />
    </FlexGroup>
    <h4>Fields</h4>
    <FieldContainer>
      <FieldLabel>Label</FieldLabel>
      <FieldInput>
        <Input placeholder="Max width 500px" />
      </FieldInput>
    </FieldContainer>
    <h4>Controls: Horizontal</h4>
    <CheckboxGroup component={FlexGroup}>
      <Checkbox value="one">Checkbox 1</Checkbox>
      <Checkbox value="two">Checkbox 2</Checkbox>
      <Checkbox value="three">Checkbox 3</Checkbox>
    </CheckboxGroup>
    <RadioGroup component={FlexGroup}>
      <Radio value="one">Radio 1</Radio>
      <Radio value="two">Radio 2</Radio>
      <Radio value="three">Radio 3</Radio>
    </RadioGroup>
    <h4>Controls: Vertical</h4>
    <CheckboxGroup component={FlexGroup} isVertical>
      <Checkbox value="one">Checkbox 1</Checkbox>
      <Checkbox value="two">Checkbox 2</Checkbox>
      <Checkbox value="three">Checkbox 3</Checkbox>
    </CheckboxGroup>
    <RadioGroup component={FlexGroup} isVertical>
      <Radio value="one">Radio 1</Radio>
      <Radio value="two">Radio 2</Radio>
      <Radio value="three">Radio 3</Radio>
    </RadioGroup>
  </Fragment>
);

export default FieldGuide;
