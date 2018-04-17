import React, { Component, Fragment } from 'react';

import Nav from '../components/Nav';
import { Container, FluidGroup } from '@keystonejs/ui/src/primitives/layout';
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
  </Fragment>
);
