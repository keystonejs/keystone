import React, { Component } from 'react';
import styled from 'react-emotion';
import { ChevronDownIcon, ChevronUpIcon } from '@keystonejs/icons';
import { colors } from '@keystonejs/ui/src/theme';

import FieldAwareSelect, { type SelectProps } from './FieldAwareSelect';
import { OptionPrimitive } from './components';

export const SortButton = styled.button(({ isActive }) => {
  const overStyles = {
    color: colors.primary,
    textDecoration: 'underline',
  };
  const activeStyles = isActive ? overStyles : null;
  return {
    background: 0,
    border: 0,
    outline: 0,
    color: 'inherit',
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    verticalAlign: 'baseline',

    ':hover, :focus': overStyles,
    ...activeStyles,
  };
});

export const SortOption = ({
  altIsDown,
  children,
  isFocused,
  isSelected,
  innerProps,
}) => {
  const Icon = isSelected
    ? ChevronUpIcon
    : altIsDown
      ? ChevronUpIcon
      : ChevronDownIcon;
  const iconColor = !isFocused && !isSelected ? colors.N40 : 'currentColor';

  return (
    <OptionPrimitive
      isFocused={isFocused}
      isSelected={isSelected}
      {...innerProps}
    >
      <span>{children}</span>
      <Icon css={{ color: iconColor }} />
    </OptionPrimitive>
  );
};

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
