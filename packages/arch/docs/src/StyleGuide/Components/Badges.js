import React from 'react';

import { Badge } from '@arch-ui/badge';
import { FlexGroup } from '@arch-ui/layout';

const appearances = ['default', 'primary', 'created', 'warning', 'danger', 'inverted'];
const BadgeGuide = () => (
  <>
    <h2>Badges</h2>
    <h4>Variant: Subtle</h4>
    <FlexGroup>
      {appearances.map(a => (
        <Badge value={55} appearance={a} key={a} />
      ))}
    </FlexGroup>
    <h4>Variant: Bold</h4>
    <FlexGroup>
      {appearances.map(a => (
        <Badge value={55} variant="bold" appearance={a} key={a} />
      ))}
    </FlexGroup>
  </>
);

export default BadgeGuide;
