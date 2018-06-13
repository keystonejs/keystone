import React, { Component } from 'react';

import { ChevronRightIcon } from '@keystonejs/icons';
import { colors, gridSize } from '@keystonejs/ui/src/theme';
import { CheckboxPrimitive, Input } from '@keystonejs/ui/src/primitives/forms';
import { FlexGroup } from '@keystonejs/ui/src/primitives/layout';
import {
  OptionRenderer,
  OptionPrimitive,
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

const CheckboxLabel = ({ isChecked, isDisabled, ...props }) => {
  return (
    <label
      css={{
        alignItems: 'center',
        border: `1px solid ${colors.N10}`,
        borderRadius: 3,
        display: 'flex',
        fontSize: '0.75em',
        fontWeight: 500,
        lineHeight: 1,
        transition: 'border-color 150ms linear',
        width: '100%',
        userSelect: 'none',

        ':hover, :focus': {
          borderColor: colors.N20,
        },
        ':active': {
          backgroundColor: colors.N05,
        },
      }}
      {...props}
    />
  );
};

// ==============================
// Actual filter UI
// ==============================

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

export default class FilterSelect extends Component<Props> {
  state = initialState;

  // Handlers
  // ==============================

  onSelectFilter = filter => {
    this.setState({ filter });
  };
  onChangeInverted = ({ target }) => {
    const isInverted = target.checked;
    const options = getOptions({ isInverted });
    console.log('filter', this.state.filter);
    const filter = getInvertedOption({
      isInverted,
      key: this.state.filter.value,
    });

    this.setState({ isInverted, options, filter });
  };
  onChangeCaseSensitivity = ({ target }) => {
    const isCaseSensitive = target.checked;
    this.setState({ isCaseSensitive });
  };
  onInputChange = ({ target }) => {
    this.setState({ inputValue: target.value });
  };
  onApply = event => {
    event.preventDefault();
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

    onChange({ event, filter: { query, label, isCaseSensitive } });
  };

  // Refs
  // ==============================

  getFilterSelect = ref => {
    if (!ref) return;
    this.filterSelectRef = ref;
  };

  render() {
    const { field } = this.props;
    const {
      filter,
      inputValue,
      isCaseSensitive,
      isInverted,
      options,
    } = this.state;

    const filterLabel = `${field.label} ${filter.label.toLowerCase()}${
      isCaseSensitive ? ' (case sensitive)' : ''
    }`;

    return (
      <div ref={this.getHeight}>
        <form css={{ marginBottom: gridSize }} onSubmit={this.onApply}>
          <Input
            onChange={this.onInputChange}
            autoFocus
            placeholder={filterLabel}
            value={inputValue}
          />
        </form>
        <FlexGroup stretch>
          <CheckboxPrimitive
            components={{ Label: CheckboxLabel }}
            onChange={this.onChangeInverted}
            checked={isInverted}
          >
            Invert Filter
          </CheckboxPrimitive>
          <CheckboxPrimitive
            components={{ Label: CheckboxLabel }}
            onChange={this.onChangeCaseSensitivity}
            checked={isCaseSensitive}
          >
            Case Sensitive
          </CheckboxPrimitive>
        </FlexGroup>
        <OptionRenderer
          innerRef={this.getFilterSelect}
          isOptionSelected={(opt, selected) => {
            return selected.filter(s => opt.label === s.label).length;
          }}
          displaySearch={false}
          options={options}
          onChange={this.onSelectFilter}
          value={filter}
        />
      </div>
    );
  }
}
