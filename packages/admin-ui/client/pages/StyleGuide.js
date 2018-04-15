import React, { Component, Fragment } from 'react';

import Nav from '../components/Nav';
import { Page } from '@keystonejs/ui/src/primitives/layout';
import { Title } from '@keystonejs/ui/src/primitives/typography';
import { Button } from '@keystonejs/ui/src/primitives/buttons';

export default class StyleGuide extends Component {
  render() {
    return (
      <Fragment>
        <Nav />
        <Page>
          <Title>Style Guide</Title>
          <h2>Buttons</h2>
          <Button>Default</Button>
          <Button appearance="primary">Primary</Button>
          <Button appearance="create">Create</Button>
          <Button appearance="danger">Destructive</Button>
        </Page>
      </Fragment>
    );
  }
}
