import React, { Component, Fragment } from 'react';
import styled from 'react-emotion';

import Nav from '../components/Nav';
import {
  Container,
  FlexGroup,
  Grid,
  Cell,
} from '@keystonejs/ui/src/primitives/layout';
import { colors } from '@keystonejs/ui/src/theme';
import { Title } from '@keystonejs/ui/src/primitives/typography';
import { Alert } from '@keystonejs/ui/src/primitives/alert';
import { Badge } from '@keystonejs/ui/src/primitives/badge';
import { Button } from '@keystonejs/ui/src/primitives/buttons';
import {
  Checkbox,
  CheckboxGroup,
  Input,
  RadioGroup,
  Radio,
} from '@keystonejs/ui/src/primitives/forms';
import {
  LoadingIndicator,
  LoadingSpinner,
} from '@keystonejs/ui/src/primitives/loading';
import {
  FieldContainer,
  FieldLabel,
  FieldInput,
} from '@keystonejs/ui/src/primitives/fields';
import { Dialog } from '@keystonejs/ui/src/primitives/modals';

const SubNav = styled.div({
  backgroundColor: colors.N05,
  borderBottom: `1px solid ${colors.N10}`,
});
const SubnavItem = styled.div(({ isSelected }) => ({
  boxShadow: isSelected ? '0 2px' : null,
  color: isSelected ? colors.text : colors.N60,
  cursor: 'pointer',
  fontWeight: isSelected ? 500 : 'normal',
  marginRight: 10,
  paddingBottom: 10,
  paddingTop: 10,

  ':hover': {
    color: colors.text,
  },
}));

const sections = ['components', 'palette'];
const upCase = s => s.charAt(0).toUpperCase() + s.slice(1);
type State = { currentSection: 'components' | 'palette' };
export default class StyleGuide extends Component<*, State> {
  state = { currentSection: sections[0] };
  render() {
    const { currentSection } = this.state;
    return (
      <Fragment>
        <Nav />
        <SubNav>
          <Container>
            <FlexGroup>
              {sections.map(s => (
                <SubnavItem
                  key={s}
                  isSelected={currentSection === s}
                  onClick={() => this.setState({ currentSection: s })}
                >
                  {upCase(s)}
                </SubnavItem>
              ))}
            </FlexGroup>
          </Container>
        </SubNav>
        <Container>
          <Title>Style Guide: {upCase(currentSection)}</Title>
          <div style={{ marginBottom: 200 }}>
            {currentSection === 'palette' ? (
              <PaletteGuide />
            ) : (
              <Fragment>
                <AlertGuide />
                <BadgeGuide />
                <ButtonGuide />
                <ModalGuide />
                <FieldGuide />
                <LayoutGuide />
                <ProgressGuide />
                <GridGuide />
              </Fragment>
            )}
          </div>
        </Container>
      </Fragment>
    );
  }
}

const AlertGuide = () => (
  <Fragment>
    <h2>Alerts</h2>
    <h4>Variant: Subtle</h4>
    <FlexGroup isVertical>
      <Alert appearance="info">
        <code>info</code>: Amet soufflé chocolate bar sugar plum topping sweet
        jelly jujubes.
      </Alert>
      <Alert appearance="danger">
        <code>danger</code>: Dessert gummi bears pudding cheesecake oat cake
        carrot cake pastry jelly beans jelly-o.
      </Alert>
      <Alert appearance="warning">
        <code>warning</code>: Croissant candy biscuit bear claw cotton candy
        sugar plum.
      </Alert>
      <Alert appearance="success">
        <code>success</code>: Bear claw chocolate cheesecake candy canes
        soufflé.
      </Alert>
    </FlexGroup>
    <h4>Variant: Bold</h4>
    <FlexGroup isVertical>
      <Alert appearance="info" variant="bold">
        <code>info</code>: Jujubes gummies candy liquorice biscuit soufflé.
      </Alert>
      <Alert appearance="danger" variant="bold">
        <code>danger</code>: Tiramisu cupcake brownie soufflé toffee cake sweet
        roll candy soufflé.
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

const ButtonGuide = () => (
  <Fragment>
    <h2>Buttons</h2>
    <h4>Variant: Bold</h4>
    <FlexGroup>
      <FlexGroup isInline>
        <Button>Default</Button>
        <Button appearance="primary">Primary</Button>
        <Button appearance="create">Create</Button>
        <Button appearance="warning">Warning</Button>
        <Button appearance="danger">Danger</Button>
      </FlexGroup>
      <FlexGroup isInline isContiguous>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </FlexGroup>
    </FlexGroup>
    <h4>Variant: Subtle</h4>
    <FlexGroup isInline>
      <Button variant="subtle" appearance="default">
        Default
      </Button>
      <Button variant="subtle" appearance="primary">
        Primary
      </Button>
      <Button variant="subtle" appearance="warning">
        Warning
      </Button>
      <Button variant="subtle" appearance="danger">
        Danger
      </Button>
    </FlexGroup>
  </Fragment>
);

class ModalGuide extends Component {
  state = { dialogIsOpen: false };
  toggleDialog = () => {
    this.setState(state => ({ dialogIsOpen: !state.dialogIsOpen }));
  };
  render() {
    const { dialogIsOpen } = this.state;
    return (
      <Fragment>
        <h2>Modals</h2>
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
    <h4>Controls: Horizontal</h4>
    <CheckboxGroup component={FlexGroup}>
      <Checkbox value="one">Checkbox 1</Checkbox>
      <Checkbox value="two">Checkbox 2</Checkbox>
      <Checkbox value="three">Checkbox 3</Checkbox>
    </CheckboxGroup>
    <RadioGroup component={FlexGroup}>
      <Radio value="one">Radio 1</Radio>
      <Radio value="two">Radio 2</Radio>
      <Radio value="three">Radio 3</Radio>
    </RadioGroup>
    <h4>Controls: Vertical</h4>
    <CheckboxGroup component={FlexGroup} isVertical>
      <Checkbox value="one">Checkbox 1</Checkbox>
      <Checkbox value="two">Checkbox 2</Checkbox>
      <Checkbox value="three">Checkbox 3</Checkbox>
    </CheckboxGroup>
    <RadioGroup component={FlexGroup} isVertical>
      <Radio value="one">Radio 1</Radio>
      <Radio value="two">Radio 2</Radio>
      <Radio value="three">Radio 3</Radio>
    </RadioGroup>
  </Fragment>
);
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
    <FlexGroupExample
      heading="Contiguous"
      groupProps={{ isContiguous: true, growIndexes: [1] }}
    />
    <FlexGroupExample
      heading="Inline"
      groupProps={{ isInline: true, growIndexes: [1] }}
    />
    <FlexGroupExample
      heading="Justify"
      groupProps={{ justify: 'space-between' }}
    />
  </Fragment>
);

// ==============================
// Grid
// ==============================

const GridBox = styled.div({
  alignItems: 'center',
  background: 'rgba(9, 30, 66, 0.04)',
  borderRadius: 2,
  boxShadow: 'inset 0 0 0 1px rgba(9, 30, 66, 0.04)',
  display: 'flex',
  justifyContent: 'center',
  height: 40,
});
const makeRow = width => (c, i, a) => (
  <Cell width={width} key={i}>
    <GridBox>
      {i + 1}/{a.length}
    </GridBox>
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

// ==============================
// Progress
// ==============================

const LoadingBox = styled.div(({ on, size }) => ({
  alignItems: 'center',
  background: on ? colors.text : null,
  borderRadius: 2,
  display: 'flex',
  justifyContent: 'center',
  height: size * 6,
  width: size * 8,
}));

const appearances = ['default', 'dark', 'primary', 'inverted'];
type State = {
  size: number,
  appearance: 'default' | 'dark' | 'primary' | 'inverted',
};
class ProgressGuide extends Component<*, State> {
  state = { appearance: 'default', size: 8 };
  handleAppearance = ({ target: { value } }) => {
    this.setState({ appearance: value });
  };
  handleSize = ({ target: { value } }) => {
    this.setState({ size: parseInt(value, 10) });
  };
  render() {
    const { appearance, size } = this.state;
    return (
      <Fragment>
        <h2>Loading</h2>
        <FlexGroup style={{ marginBottom: '1em' }}>
          <div css={{ alignItems: 'center', display: 'flex' }}>
            <input
              type="range"
              min="4"
              max="16"
              value={size}
              onChange={this.handleSize}
            />
          </div>
          <div>
            {appearances.map(a => (
              <label key={a} css={{ padding: '0.5em' }}>
                <input
                  type="radio"
                  name="appearance"
                  value={a}
                  onChange={this.handleAppearance}
                  checked={a === appearance}
                />
                <code css={{ marginLeft: '0.25em' }}>{a}</code>
              </label>
            ))}
          </div>
        </FlexGroup>
        <FlexGroup>
          <div css={{ height: 120 }}>
            <h4 css={{ marginBottom: 4, marginTop: 0 }}>Indicator</h4>
            <LoadingBox size={size} on={appearance === 'inverted'}>
              <LoadingIndicator size={size} appearance={appearance} />
            </LoadingBox>
          </div>
          <div css={{ height: 120 }}>
            <h4 css={{ marginBottom: 4, marginTop: 0 }}>Spinner</h4>
            <LoadingBox size={size} on={appearance === 'inverted'}>
              <LoadingSpinner size={size * 3} appearance={appearance} />
            </LoadingBox>
          </div>
        </FlexGroup>
      </Fragment>
    );
  }
}
const Swatch = ({ color, name, prefix }) => (
  <div
    style={{ backgroundColor: color }}
    css={{
      borderRadius: 2,
      boxSizing: 'border-box',
      color: 'white',
      textShadow: '1px 1px 1px rgba(0,0,0,0.1)',
      fontWeight: 500,
      paddingBottom: '100%',
      position: 'relative',
    }}
  >
    <code css={{ position: 'absolute', left: 8, top: 8 }}>
      {prefix}.{name}
    </code>
  </div>
);
const Hue = ({ heading, group }) => {
  const groupList = Object.keys(group).reverse();
  return (
    <Fragment>
      <h4>{heading}</h4>
      <Grid>
        {groupList.map(k => {
          const clr = group[k];
          return (
            <Cell key={k}>
              <Swatch prefix={heading.slice(0, 1)} color={clr} name={k} />
            </Cell>
          );
        })}
      </Grid>
    </Fragment>
  );
};
const PaletteGuide = () => {
  return (
    <Fragment>
      <h2>Palette</h2>
      <Hue heading="Reds" group={colors.R} />
      <Hue heading="Greens" group={colors.G} />
      <Hue heading="Blues" group={colors.B} />
      <Hue heading="Yellows" group={colors.Y} />
    </Fragment>
  );
};
