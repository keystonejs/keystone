import React, { Component, Fragment } from 'react';

import { AlertIcon, DashboardIcon, PencilIcon, PlusIcon, MegaphoneIcon } from '@arch-ui/icons';
import { Button, IconButton, LoadingButton } from '@arch-ui/button';
import { FlexGroup } from '@arch-ui/layout';

export default class ButtonGuide extends Component {
  state = { loading: '' };
  loadingClick = variant => () => {
    const loading = variant === this.state.loading ? '' : variant;
    this.setState({ loading });
  };
  render() {
    const { loading } = this.state;
    const loadingTypes = [
      { appearance: 'default', variant: 'dots' },
      { appearance: 'primary', variant: 'dots' },
      { appearance: 'default', variant: 'spinner' },
      { appearance: 'primary', variant: 'spinner' },
    ];
    const iconTypes = [
      { appearance: 'default', icon: DashboardIcon },
      { appearance: 'primary', icon: PencilIcon },
      { appearance: 'create', icon: PlusIcon },
      { appearance: 'warning', icon: MegaphoneIcon },
      { appearance: 'danger', icon: AlertIcon },
    ];
    return (
      <Fragment>
        <h2>Buttons</h2>
        <h4>Variant: Bold</h4>
        <FlexGroup>
          <FlexGroup isInline>
            {['Default', 'Primary', 'Create', 'Warning', 'Danger'].map(s => (
              <Button key={s} appearance={s.toLowerCase()}>
                {s}
              </Button>
            ))}
          </FlexGroup>
          <FlexGroup isInline isContiguous>
            <Button>First</Button>
            <Button>Second</Button>
            <Button>Third</Button>
          </FlexGroup>
        </FlexGroup>
        <FlexGroup style={{ marginTop: '1em' }}>
          <FlexGroup isInline>
            {['Default', 'Primary'].map(s => (
              <Button key={s} appearance={s.toLowerCase()} isDisabled>
                {s}: <code>isDisabled</code>
              </Button>
            ))}
          </FlexGroup>
          <FlexGroup isInline>
            {['Default', 'Primary'].map(s => (
              <Button key={s} appearance={s.toLowerCase()} isActive>
                {s}: <code>isActive</code>
              </Button>
            ))}
          </FlexGroup>
        </FlexGroup>
        <h4>Variant: Subtle</h4>
        <FlexGroup isInline>
          {['Default', 'Primary', 'Warning', 'Danger'].map(s => (
            <Button key={s} variant="subtle" appearance={s.toLowerCase()}>
              {s}
            </Button>
          ))}
        </FlexGroup>
        <h4>Variant: Ghost</h4>
        <FlexGroup isInline>
          {['Default', 'Primary', 'Create', 'Warning', 'Danger'].map(s => (
            <Button key={s} variant="ghost" appearance={s.toLowerCase()}>
              {s}
            </Button>
          ))}
        </FlexGroup>
        <h4>Loading Buttons</h4>
        <FlexGroup isInline>
          {loadingTypes.map(b => {
            const key = `${b.variant}-${b.appearance}`;
            return (
              <LoadingButton
                appearance={b.appearance}
                key={key}
                isLoading={loading === key}
                onClick={this.loadingClick(key)}
                indicatorVariant={b.variant}
              >
                {`${b.variant} ${b.appearance}`}
              </LoadingButton>
            );
          })}
        </FlexGroup>
        <h4>Icon Buttons</h4>
        <FlexGroup isInline>
          {iconTypes.map(b => (
            <IconButton {...b} key={b.appearance}>
              {b.appearance}
            </IconButton>
          ))}
        </FlexGroup>
      </Fragment>
    );
  }
}
