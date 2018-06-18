// @flow

import React, { Component } from 'react';

import { ChevronRightIcon } from '@keystonejs/icons';
import { colors, gridSize } from '@keystonejs/ui/src/theme';
import { CheckboxPrimitive, Input } from '@keystonejs/ui/src/primitives/forms';
import { FlexGroup } from '@keystonejs/ui/src/primitives/layout';
import {
  OptionRenderer,
  OptionPrimitive,
  CheckboxGroup,
  Checkbox,
} from '@keystonejs/ui/src/primitives/filters';

// ==============================
// TODO: move this somewhere else?
// ==============================

const filterOptions = {
  default: [
    { label: 'Is exactly', value: '', invertedValue: '_not' },
    { label: 'Contains', value: '_contains', invertedValue: '_not_contains' },
    {
      label: 'Starts with',
      value: '_starts_with',
      invertedValue: '_not_starts_with',
    },
    {
      label: 'Ends with',
      value: '_ends_with',
      invertedValue: '_not_ends_with',
    },
  ],
  inverted: [
    { label: 'Is not exactly', value: '_not', invertedValue: '' },
    {
      label: 'Does not contain',
      value: '_not_contains',
      invertedValue: '_contains',
    },
    {
      label: 'Does not start with',
      value: '_not_starts_with',
      invertedValue: '_starts_with',
    },
    {
      label: 'Does not end with',
      value: '_not_ends_with',
      invertedValue: '_ends_with',
    },
  ],
};
function getOptions({ isInverted }) {
  const type = isInverted ? 'inverted' : 'default';
  return filterOptions[type];
}
function getOption({ isInverted, key }) {
  const type = isInverted ? 'inverted' : 'default';

  return filterOptions[type].find(opt => opt.value === key);
}
function getInvertedOption({ isInverted, key }) {
  const type = isInverted ? 'inverted' : 'default';

  return filterOptions[type].find(opt => opt.invertedValue === key);
}
function getQuery({ path, key, isInverted }) {
  const option = getOption({ isInverted, key });

  return `${path}${option.value}`;
}

// ==============================
// Custom Components
// ==============================

export const FilterOption = ({ children, isFocused, isSelected, ...props }) => {
  let iconColor = !isFocused && !isSelected ? colors.N40 : 'currentColor';

  return (
    <OptionPrimitive isFocused={isFocused} isSelected={isSelected} {...props}>
      <span>{children}</span>
      <ChevronRightIcon css={{ color: iconColor }} />
    </OptionPrimitive>
  );
};

// ==============================
// Actual filter UI
// ==============================

function isOptionSelected(opt, selected) {
  return selected.filter(s => opt.label === s.label).length;
}

type Props = {
  field: Object,
};
const initialState = {
  filter: getOption({ isInverted: false, key: '_contains' }),
  inputValue: '',
  isCaseSensitive: false,
  isInverted: false,
  options: getOptions({ isInverted: false }),
};

type FilterObject = {
  query: { [queryPath: string]: string },
  label: string,
  isCaseSensitive: boolean,
};

export default class FilterSelect extends Component<Props> {
  // static getInitialState(): FilterObject {
  //   return {
  //     query: 'query',
  //     label: 'label',
  //     isCaseSensitive: false,
  //   }
  // }
  state = initialState;

  // Handlers
  // ==============================

  onTypeChange = filter => {
    this.setState({ filter }, this.updateQuery);
  };
  onCheckboxChange = value => {
    const isInverted = value.includes('isInverted');
    const isCaseSensitive = value.includes('isCaseSensitive');

    // fork method calls and guard against invalid changes
    if (isInverted !== this.state.isInverted) {
      this.onChangeInverted(isInverted);
    }
    if (isCaseSensitive !== this.state.isCaseSensitive) {
      this.onChangeCaseSensitivity(isCaseSensitive);
    }
  };
  onChangeInverted = isInverted => {
    const options = getOptions({ isInverted });
    const filter = getInvertedOption({
      isInverted,
      key: this.state.filter.value,
    });

    this.setState({ isInverted, options, filter }, this.updateQuery);
  };
  onChangeCaseSensitivity = isCaseSensitive => {
    this.setState({ isCaseSensitive }, this.updateQuery);
  };
  onInputChange = ({ target }) => {
    this.setState({ inputValue: target.value }, this.updateQuery);
  };
  updateQuery = () => {
    const { field, onChange } = this.props;
    const { filter, inputValue, isInverted, isCaseSensitive } = this.state;
    const queryPath = getQuery({
      path: field.path,
      key: filter.value,
      isInverted,
    });

    const expression = filter.label.toLowerCase();
    const label = `${field.label} ${expression}: "${inputValue}"`;
    const query = { [queryPath]: inputValue };

    onChange({ query, label, isCaseSensitive });
  };

  render() {
    const { field } = this.props;
    const { filter, inputValue, isCaseSensitive, options } = this.state;

    const filterLabel = `${field.label} ${filter.label.toLowerCase()}${
      isCaseSensitive ? ' (case sensitive)' : ''
    }`;

    return (
      <div ref={this.getHeight}>
        <div css={{ marginBottom: gridSize }}>
          <Input
            onChange={this.onInputChange}
            autoFocus
            placeholder={filterLabel}
            value={inputValue}
          />
        </div>
        <CheckboxGroup onChange={this.onCheckboxChange}>
          <Checkbox value="isInverted">Invert Filter</Checkbox>
          {/* <Checkbox value="isCaseSensitive">Case Sensitive</Checkbox> */}
        </CheckboxGroup>
        <OptionRenderer
          isOptionSelected={isOptionSelected}
          displaySearch={false}
          options={options}
          onChange={this.onTypeChange}
          value={filter}
        />
      </div>
    );
  }
}
