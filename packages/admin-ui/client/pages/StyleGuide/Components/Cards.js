import React, { Fragment } from 'react';

import { Card, Canvas } from '@arch-ui/card';

const CardGuide = () => (
  <Fragment>
    <h2>Cards</h2>
    <p>Content container</p>
    <Card style={{ marginBottom: 12 }} isPadded={false}>
      Un-padded Card
    </Card>
    <Card style={{ marginBottom: 12 }}>Padded Card</Card>
    <Card style={{ marginBottom: 12 }} isInteractive>
      Interactive Card
    </Card>
    <h4>Canvas</h4>
    <p>Use a canvas to tie cards together</p>
    <Canvas>
      <div style={{ display: 'flex' }}>
        <Card style={{ flex: 3 }}>Main</Card>
        <Card style={{ flex: 1, marginLeft: 8 }}>Aside</Card>
      </div>
    </Canvas>
  </Fragment>
);

export default CardGuide;
