import React, { Fragment } from 'react';

import { Badge } from '@keystonejs/ui/src/primitives/badge';
import { FlexGroup } from '@keystonejs/ui/src/primitives/layout';

const BadgeGuide = () => (
  <Fragment>
    <h2>Badges</h2>
    <h4>Variant: Subtle</h4>
    <FlexGroup>
      <Badge value={55} />
      <Badge value={55} appearance="primary" />
      <Badge value={55} appearance="important" />
      <Badge value={55} appearance="created" />
    </FlexGroup>
    <h4>Variant: Bold</h4>
    <FlexGroup>
      <Badge value={55} variant="bold" />
      <Badge value={55} appearance="primary" variant="bold" />
      <Badge value={55} appearance="important" variant="bold" />
      <Badge value={55} appearance="created" variant="bold" />
    </FlexGroup>
  </Fragment>
);

export default BadgeGuide;
