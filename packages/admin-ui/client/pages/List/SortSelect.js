import React, { Component } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@keystonejs/icons';
import { colors } from '@keystonejs/ui/src/theme';

import FieldAwareSelect, { type SelectProps } from './FieldAwareSelect';
import { OptionPrimitive } from './components';

export class SortOption extends Component {
  handleChange = value => {
    const { altIsDown, isSelected } = this.props;
    const inverted = altIsDown || isSelected;
    console.log('SortOption', value, inverted);
    this.props.onChange(value, inverted);
  };
  render() {
    const {
      altIsDown,
      children,
      isFocused,
      isSelected,
      innerProps,
    } = this.props;
    const Icon = isSelected
      ? ChevronUpIcon
      : altIsDown ? ChevronUpIcon : ChevronDownIcon;
    const iconColor = !isFocused && !isSelected ? colors.N40 : 'currentColor';

    return (
      <OptionPrimitive
        isFocused={isFocused}
        isSelected={isSelected}
        {...innerProps}
        onChange={this.handleChange}
      >
        <span>{children}</span>
        <Icon css={{ color: iconColor }} />
      </OptionPrimitive>
    );
  }
}

type State = { altIsDown: boolean };

export default class SortSelect extends Component<SelectProps, State> {
  state = { altIsDown: false };
  componentDidMount() {
    document.body.addEventListener('keydown', this.handleKeyDown, false);
    document.body.addEventListener('keyup', this.handleKeyUp, false);
  }
  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.handleKeyDown);
    document.body.removeEventListener('keyup', this.handleKeyUp);
  }
  handleKeyDown = e => {
    if (e.key !== 'Alt') return;
    this.setState({ altIsDown: true });
  };
  handleKeyUp = e => {
    if (e.key !== 'Alt') return;
    this.setState({ altIsDown: false });
  };
  handleChange = sortBy => {
    const { altIsDown } = this.state;
    const isSelected = sortBy.path === this.props.value.path;
    const inverted = altIsDown || isSelected;
    this.props.onChange({ sortBy, inverted });
  };
  augmentedOption = props => (
    <SortOption altIsDown={this.state.altIsDown} {...props} />
  );

  render() {
    return (
      <FieldAwareSelect
        {...this.props}
        onChange={this.handleChange}
        placeholder="Find a field..."
        components={{
          Option: this.augmentedOption,
        }}
      />
    );
  }
}
