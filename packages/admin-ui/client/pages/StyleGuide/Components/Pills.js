import React, { Fragment } from 'react';

import { Pill } from '@voussoir/ui/src/primitives/pill';
import { FlexGroup } from '@voussoir/ui/src/primitives/layout';

const appearances = ['Default', 'Primary', 'Danger', 'Create', 'Warning'];
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
    <h4>Variant: Bold</h4>
    <FlexGroup>
      {appearances.map(a => (
        <Pill variant="bold" appearance={a.toLowerCase()} key={a} onRemove={console.log}>
          {a}
        </Pill>
      ))}
    </FlexGroup>
  </Fragment>
);

export default PillGuide;
