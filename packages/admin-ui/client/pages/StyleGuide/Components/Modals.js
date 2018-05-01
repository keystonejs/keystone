import React, { Component, Fragment } from 'react';
import styled from 'react-emotion';

import { Button } from '@keystonejs/ui/src/primitives/buttons';
import { FlexGroup } from '@keystonejs/ui/src/primitives/layout';
import { Dialog, Dropdown, Popout } from '@keystonejs/ui/src/primitives/modals';

export default class ModalGuide extends Component {
  state = { dialogIsOpen: false };
  toggleDialog = () => {
    this.setState(state => ({ dialogIsOpen: !state.dialogIsOpen }));
  };
  render() {
    const { dialogIsOpen } = this.state;
    return (
      <Fragment>
        <h2>Modals</h2>

        <h4>Dropdowns</h4>
        <Dropdown
          // selectClosesMenu={false}
          items={[
            { to: '/admin', content: 'Home' },
            { content: 'Macaroon', onClick: console.log },
            { content: 'Cupcake', onClick: console.log },
            { content: 'Liquorice', onClick: console.log },
            { content: 'Cookie', onClick: console.log },
            { content: 'Cake', onClick: console.log },
          ]}
        >
          <Button>Show menu</Button>
        </Dropdown>

        <h4>Popouts</h4>
        <FlexGroup justify="space-between">
          <Popout content={<PopoutContent>Left</PopoutContent>}>
            <Button>Left</Button>
          </Popout>
          <Popout content={<PopoutContent>Intermediate Left</PopoutContent>}>
            <Button>Intermediate Left</Button>
          </Popout>
          <Popout content={<PopoutContent>Middle</PopoutContent>}>
            <Button>Middle</Button>
          </Popout>
          <Popout content={<PopoutContent>Intermediate Right</PopoutContent>}>
            <Button>Intermediate Right</Button>
          </Popout>
          <Popout content={<PopoutContent>Right</PopoutContent>}>
            <Button>Right</Button>
          </Popout>
        </FlexGroup>

        <h4>Dialog</h4>
        <Button onClick={this.toggleDialog}>Open Dialog</Button>
        <Dialog
          isOpen={dialogIsOpen}
          onClose={this.toggleDialog}
          heading="Dialog"
          footer={
            <Fragment>
              <Button appearance="primary" onClick={this.toggleDialog}>
                Do Thing
              </Button>
              <Button
                appearance="warning"
                variant="subtle"
                onClick={this.toggleDialog}
              >
                Cancel
              </Button>
            </Fragment>
          }
        >
          <p>
            Cupcake ipsum dolor. Sit amet gummi bears toffee. Dessert danish
            fruitcake cupcake powder pie soufflé macaroon cake.
          </p>
          <p>
            Icing cheesecake topping. Jelly jujubes lemon drops tart jujubes.
            Biscuit jujubes jelly-o chupa chups tiramisu. Fruitcake brownie
            donut.
          </p>
          <p>
            Soufflé chocolate bar tart sweet. Gummies sweet roll danish sesame
            snaps danish liquorice apple pie pie. Apple pie donut pudding dragée
            gummies soufflé powder.
          </p>
          <p>
            Chocolate bear claw dragée fruitcake liquorice. Caramels wafer
            fruitcake brownie caramels jelly. Tiramisu jelly-o jelly pastry bear
            claw gummies.
          </p>
          <p>
            Liquorice jelly-o icing oat cake oat cake halvah tootsie roll.
            Fruitcake caramels danish tart gingerbread candy macaroon
            gingerbread sweet. Sugar plum fruitcake wafer.
          </p>
        </Dialog>
      </Fragment>
    );
  }
}

const PopoutContent = styled.div({
  padding: 20,
});
