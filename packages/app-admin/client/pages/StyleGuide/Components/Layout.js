import React, { Fragment } from 'react';

import { Button } from '@arch-ui/button';
import { FlexGroup } from '@arch-ui/layout';
import { Input } from '@arch-ui/input';

const FlexGroupExample = ({ heading, groupProps }) => (
  <Fragment>
    <h4>{heading}</h4>
    <FlexGroup {...groupProps}>
      <Button>Alpha</Button>
      <Input placeholder="All the space!" />
      <Button appearance="primary">Omega</Button>
    </FlexGroup>
  </Fragment>
);

const LayoutGuide = () => (
  <Fragment>
    <h2>Flex Group</h2>
    <FlexGroupExample heading="Default" groupProps={{ growIndexes: [1] }} />
    <FlexGroupExample heading="Contiguous" groupProps={{ isContiguous: true, growIndexes: [1] }} />
    <FlexGroupExample heading="Inline" groupProps={{ isInline: true, growIndexes: [1] }} />
    <FlexGroupExample heading="Justify" groupProps={{ justify: 'space-between' }} />
  </Fragment>
);

export default LayoutGuide;
