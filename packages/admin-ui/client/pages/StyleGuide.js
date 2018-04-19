import React, { Component, Fragment } from 'react';

import Nav from '../components/Nav';
import {
  Container,
  ContiguousGroup,
  FluidGroup,
  Grid,
  Cell,
} from '@keystonejs/ui/src/primitives/layout';
import { Title } from '@keystonejs/ui/src/primitives/typography';
import { Button } from '@keystonejs/ui/src/primitives/buttons';
import { Input } from '@keystonejs/ui/src/primitives/forms';
import {
  FieldContainer,
  FieldLabel,
  FieldInput,
} from '@keystonejs/ui/src/primitives/fields';

export default class StyleGuide extends Component {
  render() {
    return (
      <Fragment>
        <Nav />
        <Container>
          <Title>Style Guide</Title>
          <div style={{ marginBottom: 200 }}>
            <ButtonGuide />
            <FieldGuide />
            <LayoutGuide />
            <GridGuide />
          </div>
        </Container>
      </Fragment>
    );
  }
}

const ButtonGuide = () => (
  <Fragment>
    <h2>Buttons</h2>
    <h4>Variant: Solid</h4>
    <FluidGroup isInline>
      <Button>Default</Button>
      <Button appearance="primary">Primary</Button>
      <Button appearance="create">Create</Button>
      <Button appearance="warning">Warning</Button>
      <Button appearance="danger">Danger</Button>
    </FluidGroup>
    <h4>Variant: Link</h4>
    <FluidGroup isInline>
      <Button variant="link">Default</Button>
      <Button variant="link" appearance="text">
        Text
      </Button>
      <Button variant="link" appearance="subtle">
        Subtle
      </Button>
      <Button variant="link" appearance="reset">
        Reset
      </Button>
      <Button variant="link" appearance="delete">
        Delete
      </Button>
    </FluidGroup>
  </Fragment>
);

const FieldGuide = () => (
  <Fragment>
    <h2>Forms</h2>
    <h4>Input</h4>
    <Input placeholder="Input field" />
    <h4>Fields</h4>
    <FieldContainer>
      <FieldLabel>Label</FieldLabel>
      <FieldInput>
        <Input placeholder="Max width 500px" />
      </FieldInput>
    </FieldContainer>
  </Fragment>
);

const LayoutGuide = () => (
  <Fragment>
    <h2>Layout</h2>
    <h4>Fluid Group</h4>
    <FluidGroup growIndexes={[1]}>
      <Button>Alpha</Button>
      <Input placeholder="All the space!" />
      <Button appearance="primary">Omega</Button>
    </FluidGroup>
    <h4>Contiguous Group</h4>
    <ContiguousGroup growIndexes={[1]}>
      <Button>Alpha</Button>
      <Input placeholder="All the space!" />
      <Button appearance="primary">Omega</Button>
    </ContiguousGroup>
  </Fragment>
);

const Box = p => (
  <div
    css={{
      alignItems: 'center',
      background: 'rgba(9, 30, 66, 0.04)',
      borderRadius: 2,
      boxShadow: 'inset 0 0 0 1px rgba(9, 30, 66, 0.04)',
      display: 'flex',
      justifyContent: 'center',
      height: 40,
    }}
    {...p}
  />
);
const makeRow = width => (c, i, a) => (
  <Cell width={width} key={i}>
    <Box>
      {i + 1}/{a.length}
    </Box>
  </Cell>
);
const GridGuide = () => {
  const twelfths = new Array(12).fill('');
  const sixths = new Array(6).fill('');
  const quarters = new Array(4).fill('');
  const halves = new Array(2).fill('');

  return (
    <Fragment>
      <h2>Grid</h2>
      <h4>Traditional</h4>
      <Grid columns={12}>
        {twelfths.map(makeRow(1))}
        {sixths.map(makeRow(2))}
        {quarters.map(makeRow(3))}
        {halves.map(makeRow(6))}
      </Grid>
    </Fragment>
  );
};
