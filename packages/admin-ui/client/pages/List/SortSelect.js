import React, { Component } from 'react';
import styled from 'react-emotion';
import { ChevronDownIcon, ChevronUpIcon } from '@keystonejs/icons';
import { colors } from '@keystonejs/ui/src/theme';

import FieldAwareSelect, { type SelectProps } from './FieldAwareSelect';
import { OptionPrimitive } from './components';
import { POPOUT_GUTTER } from '../../components/Popout';

export const SortButton = styled.button(({ isActive }) => {
  const overStyles = {
    color: colors.primary,
    borderBottomColor: colors.primary,
  };
  const activeStyles = isActive ? overStyles : null;
  return {
    background: 0,
    border: 0,
    borderBottom: `1px solid ${colors.N40}`,
    outline: 0,
    color: 'inherit',
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    marginLeft: '0.5ex',
    padding: 0,
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
  ...props
}) => {
  const Icon = isSelected
    ? ChevronUpIcon
    : altIsDown
      ? ChevronUpIcon
      : ChevronDownIcon;
  const iconColor = !isFocused && !isSelected ? colors.N40 : 'currentColor';

  return (
    <OptionPrimitive isFocused={isFocused} isSelected={isSelected} {...props}>
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
      <div css={{ padding: POPOUT_GUTTER }}>
        <FieldAwareSelect
          {...this.props}
          onChange={this.handleChange}
          placeholder="Find a field..."
          components={{
            Option: this.augmentedOption,
          }}
        />
      </div>
    );
  }
}
