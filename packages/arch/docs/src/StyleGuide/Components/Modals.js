import React, { Fragment, useState } from 'react';
import styled from '@emotion/styled';

import { Button } from '@arch-ui/button';
import { FlexGroup } from '@arch-ui/layout';
import Dialog from '@arch-ui/dialog';
import Dropdown from '@arch-ui/dropdown';
import Popout from '@arch-ui/popout';
import Tooltip from '@arch-ui/tooltip';

const handleDropdownClick = ({ data }) => {
  console.log(`You selected "${data.content}", yum!`);
};

const dropdownItems = [
  { to: '/admin', content: 'Dashboard' },
  { content: 'Macaroon', onClick: handleDropdownClick },
  { content: 'Cupcake', onClick: handleDropdownClick },
  { content: 'Liquorice', onClick: handleDropdownClick },
  { content: 'Cookie', onClick: handleDropdownClick },
  { content: 'Cake', onClick: handleDropdownClick },
];

const ModalGuide = () => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  const toggleDialog = () => {
    setDialogIsOpen(dialogWasOpen => !dialogWasOpen);
  };

  const handleDialogKeyDown = ({ key }) => {
    if (key === 'Escape') setDialogIsOpen(false);
  };

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
          <Dropdown
            align={a}
            key={a}
            target={props => <Button {...props}>Align {a}</Button>}
            items={dropdownItems}
          />
        ))}
      </FlexGroup>

      <h4>Popouts</h4>
      <FlexGroup justify="space-between">
        <Popout target={props => <Button {...props}>Left</Button>}>
          <PopoutContent>Left</PopoutContent>
        </Popout>
        <Popout target={props => <Button {...props}>Intermediate Left</Button>}>
          <PopoutContent>Intermediate Left</PopoutContent>
        </Popout>
        <Popout target={props => <Button {...props}>Middle</Button>}>
          <PopoutContent>Middle</PopoutContent>
        </Popout>
        <Popout target={props => <Button {...props}>Intermediate Right</Button>}>
          <PopoutContent>Intermediate Right</PopoutContent>
        </Popout>
        <Popout target={props => <Button {...props}>Right</Button>}>
          <PopoutContent>Right</PopoutContent>
        </Popout>
      </FlexGroup>

      <h4>Dialog</h4>
      <Button onClick={toggleDialog}>Open Dialog</Button>
      <Dialog
        isOpen={dialogIsOpen}
        onKeyDown={handleDialogKeyDown}
        onClose={toggleDialog}
        heading="Dialog"
        footer={
          <Fragment>
            <Button appearance="primary" onClick={toggleDialog}>
              Do Thing
            </Button>
            <Button appearance="warning" variant="subtle" onClick={toggleDialog}>
              Cancel
            </Button>
          </Fragment>
        }
      >
        <p>
          Cupcake ipsum dolor. Sit amet gummi bears toffee. Dessert danish fruitcake cupcake powder
          pie soufflé macaroon cake.
        </p>
        <p>
          Icing cheesecake topping. Jelly jujubes lemon drops tart jujubes. Biscuit jujubes jelly-o
          chupa chups tiramisu. Fruitcake brownie donut.
        </p>
        <p>
          Soufflé chocolate bar tart sweet. Gummies sweet roll danish sesame snaps danish liquorice
          apple pie pie. Apple pie donut pudding dragée gummies soufflé powder.
        </p>
        <p>
          Chocolate bear claw dragée fruitcake liquorice. Caramels wafer fruitcake brownie caramels
          jelly. Tiramisu jelly-o jelly pastry bear claw gummies.
        </p>
        <p>
          Liquorice jelly-o icing oat cake oat cake halvah tootsie roll. Fruitcake caramels danish
          tart gingerbread candy macaroon gingerbread sweet. Sugar plum fruitcake wafer.
        </p>
      </Dialog>
    </Fragment>
  );
};

export default ModalGuide;

const PopoutContent = styled.div({
  padding: 20,
});
