import React, { Fragment } from 'react';

import { Lozenge } from '@arch-ui/lozenge';
import { FlexGroup } from '@arch-ui/layout';

const appearances = ['Default', 'Primary', 'Danger', 'Create', 'Warning'];
const LozengeGuide = () => (
  <Fragment>
    <h2>Lozenges</h2>
    <h4>Variant: Subtle</h4>
    <FlexGroup>
      {appearances.map(a => (
        <Lozenge appearance={a.toLowerCase()} key={a}>
          {a}
        </Lozenge>
      ))}
    </FlexGroup>
    <h4>Variant: Bold</h4>
    <FlexGroup>
      {appearances.map(a => (
        <Lozenge variant="bold" appearance={a.toLowerCase()} key={a}>
          {a}
        </Lozenge>
      ))}
    </FlexGroup>
  </Fragment>
);

export default LozengeGuide;
