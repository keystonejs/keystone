import React, { Fragment } from 'react';

import { Badge } from '@keystonejs/ui/src/primitives/badge';
import { FlexGroup } from '@keystonejs/ui/src/primitives/layout';

const appearances = [
  'default',
  'primary',
  'created',
  'warning',
  'danger',
  'inverted',
];
const BadgeGuide = () => (
  <Fragment>
    <h2>Badges</h2>
    <h4>Variant: Subtle</h4>
    <FlexGroup>
      {appearances.map(a => <Badge value={55} appearance={a} />)}
    </FlexGroup>
    <h4>Variant: Bold</h4>
    <FlexGroup>
      {appearances.map(a => <Badge value={55} variant="bold" appearance={a} />)}
    </FlexGroup>
  </Fragment>
);

export default BadgeGuide;
