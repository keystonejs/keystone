import React, { Fragment } from 'react';

import { Alert } from '@voussoir/ui/src/primitives/alert';
import { FlexGroup } from '@voussoir/ui/src/primitives/layout';

const AlertGuide = () => (
  <Fragment>
    <h2>Alerts</h2>
    <h4>Variant: Subtle</h4>
    <FlexGroup isVertical>
      <Alert appearance="info">
        <code>info</code>: Amet soufflé chocolate bar sugar plum topping sweet jelly jujubes.
      </Alert>
      <Alert appearance="danger">
        <code>danger</code>: Dessert gummi bears pudding cheesecake oat cake carrot cake pastry
        jelly beans jelly-o.
      </Alert>
      <Alert appearance="warning">
        <code>warning</code>: Croissant candy biscuit bear claw cotton candy sugar plum.
      </Alert>
      <Alert appearance="success">
        <code>success</code>: Bear claw chocolate cheesecake candy canes soufflé.
      </Alert>
    </FlexGroup>
    <h4>Variant: Bold</h4>
    <FlexGroup isVertical>
      <Alert appearance="info" variant="bold">
        <code>info</code>: Jujubes gummies candy liquorice biscuit soufflé.
      </Alert>
      <Alert appearance="danger" variant="bold">
        <code>danger</code>: Tiramisu cupcake brownie soufflé toffee cake sweet roll candy soufflé.
      </Alert>
      <Alert appearance="warning" variant="bold">
        <code>warning</code>: Bear claw dessert cake jelly beans cake.
      </Alert>
      <Alert appearance="success" variant="bold">
        <code>success</code>: Toffee cheesecake chocolate cake macaroon soufflé.
      </Alert>
    </FlexGroup>
  </Fragment>
);

export default AlertGuide;
