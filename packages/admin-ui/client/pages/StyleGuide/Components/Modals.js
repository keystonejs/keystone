import React, { Component, Fragment } from 'react';
import styled from '@emotion/styled';

import { Button } from '@arch-ui/button';
import { FlexGroup } from '@arch-ui/layout';
import { Dialog, Dropdown, Popout, Tooltip } from '@voussoir/ui/src/primitives/modals';

export default class ModalGuide extends Component {
  state = { dialogIsOpen: false };
  toggleDialog = () => {
    this.setState(state => ({ dialogIsOpen: !state.dialogIsOpen }));
  };
  handleDropdownClick = ({ data }) => {
    console.log(`You selected "${data.content}", yum!`);
  };
  handleDialogKeyDown = ({ key }) => {
    if (key !== 'Escape') return;
    this.setState({ dialogIsOpen: false });
  };
  render() {
    const { dialogIsOpen } = this.state;
    const dropdownItems = [
      { to: '/admin', content: 'Dashboard' },
      { content: 'Macaroon', onClick: this.handleDropdownClick },
      { content: 'Cupcake', onClick: this.handleDropdownClick },
      { content: 'Liquorice', onClick: this.handleDropdownClick },
      { content: 'Cookie', onClick: this.handleDropdownClick },
      { content: 'Cake', onClick: this.handleDropdownClick },
    ];

    return (
      <Fragment>
        <h2>Modals</h2>

        <h4>Tooltips</h4>
        <FlexGroup justify="space-between">
          {['top', 'right', 'bottom', 'left'].map(p => (
            <Tooltip key={p} content="Some tooltip content" placement={p}>
              {ref => <Button ref={ref}>Show {p}</Button>}
            </Tooltip>
          ))}
        </FlexGroup>

        <h4>Dropdowns</h4>
        <FlexGroup justify="space-between">
          {['left', 'right'].map(a => (
            <Dropdown align={a} key={a} target={<Button>Align {a}</Button>} items={dropdownItems} />
          ))}
        </FlexGroup>

        <h4>Popouts</h4>
        <FlexGroup justify="space-between">
          <Popout target={<Button>Left</Button>}>
            <PopoutContent>Left</PopoutContent>
          </Popout>
          <Popout target={<Button>Intermediate Left</Button>}>
            <PopoutContent>Intermediate Left</PopoutContent>
          </Popout>
          <Popout target={<Button>Middle</Button>}>
            <PopoutContent>Middle</PopoutContent>
          </Popout>
          <Popout target={<Button>Intermediate Right</Button>}>
            <PopoutContent>Intermediate Right</PopoutContent>
          </Popout>
          <Popout target={<Button>Right</Button>}>
            <PopoutContent>Right</PopoutContent>
          </Popout>
        </FlexGroup>

        <h4>Dialog</h4>
        <Button onClick={this.toggleDialog}>Open Dialog</Button>
        <Dialog
          isOpen={dialogIsOpen}
          onKeyDown={this.handleDialogKeyDown}
          onClose={this.toggleDialog}
          heading="Dialog"
          footer={
            <Fragment>
              <Button appearance="primary" onClick={this.toggleDialog}>
                Do Thing
              </Button>
              <Button appearance="warning" variant="subtle" onClick={this.toggleDialog}>
                Cancel
              </Button>
            </Fragment>
          }
        >
          <p>
            Cupcake ipsum dolor. Sit amet gummi bears toffee. Dessert danish fruitcake cupcake
            powder pie soufflé macaroon cake.
          </p>
          <p>
            Icing cheesecake topping. Jelly jujubes lemon drops tart jujubes. Biscuit jujubes
            jelly-o chupa chups tiramisu. Fruitcake brownie donut.
          </p>
          <p>
            Soufflé chocolate bar tart sweet. Gummies sweet roll danish sesame snaps danish
            liquorice apple pie pie. Apple pie donut pudding dragée gummies soufflé powder.
          </p>
          <p>
            Chocolate bear claw dragée fruitcake liquorice. Caramels wafer fruitcake brownie
            caramels jelly. Tiramisu jelly-o jelly pastry bear claw gummies.
          </p>
          <p>
            Liquorice jelly-o icing oat cake oat cake halvah tootsie roll. Fruitcake caramels danish
            tart gingerbread candy macaroon gingerbread sweet. Sugar plum fruitcake wafer.
          </p>
        </Dialog>
      </Fragment>
    );
  }
}

const PopoutContent = styled.div({
  padding: 20,
});
