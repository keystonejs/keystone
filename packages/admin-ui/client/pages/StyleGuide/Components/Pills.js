import React, { Fragment } from 'react';

import { Pill } from '@arch-ui/pill';
import { FlexGroup } from '@arch-ui/layout';

const appearances = ['Default', 'Primary'];
const PillGuide = () => (
  <Fragment>
    <h2>Pills</h2>
    <h4>Variant: Subtle</h4>
    <FlexGroup>
      {appearances.map(a => (
        <Pill appearance={a.toLowerCase()} key={a} onRemove={console.log}>
          {a}
        </Pill>
      ))}
    </FlexGroup>
  </Fragment>
);

export default PillGuide;
