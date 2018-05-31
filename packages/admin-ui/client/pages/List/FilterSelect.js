import React, { Component, Fragment } from 'react';
import { Transition, TransitionGroup } from 'react-transition-group';

import { ChevronLeftIcon, ChevronRightIcon } from '@keystonejs/icons';
import { colors, gridSize } from '@keystonejs/ui/src/theme';
import { A11yText } from '@keystonejs/ui/src/primitives/typography';
import { CheckboxPrimitive, Input } from '@keystonejs/ui/src/primitives/forms';
import { FlexGroup } from '@keystonejs/ui/src/primitives/layout';

import FieldAwareSelect, { type SelectProps } from './FieldAwareSelect';
import OptionRenderer from './OptionRenderer';
import { OptionPrimitive } from './components';
import { Popout, POPOUT_GUTTER } from '../../components/Popout';

export const FilterOption = ({ children, isFocused, isSelected, ...props }) => {
  let iconColor = !isFocused && !isSelected ? colors.N40 : 'currentColor';

  return (
    <OptionPrimitive isFocused={isFocused} isSelected={isSelected} {...props}>
      <span>{children}</span>
      <ChevronRightIcon css={{ color: iconColor }} />
    </OptionPrimitive>
  );
};

const Back = props => (
  <div
    css={{
      cursor: 'pointer',
      marginLeft: -gridSize,
      padding: gridSize,
    }}
    role="button"
    {...props}
  >
    <ChevronLeftIcon />
    <A11yText>Back to Fields</A11yText>
  </div>
);
const FooterButton = ({ isPrimary, ...props }) => (
  <div
    css={{
      cursor: 'pointer',
      color: isPrimary ? colors.primary : colors.N40,
      fontSize: '0.85em',
      fontWeight: isPrimary ? 'bold' : null,
      margin: -gridSize,
      padding: gridSize,

      ':hover, :focus': {
        outline: 0,
        textDecoration: 'underline',
      },
    }}
    role="button"
    tabIndex="0"
    {...props}
  />
);
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

// const filterOptions = {
//   default: {
//     EXACTLY: 'Is exactly',
//     _contains: 'Contains',
//     _starts_with: 'Starts with',
//     _ends_with: 'Ends with',
//   },
//   inverted: {
//     _not: 'not exactly',
//     _not_contains: 'not contain',
//     _not_starts_with: 'start with',
//     _not_ends_with: 'end with',
//   },
// };

const filterOptions = {
  default: {
    exactly: { label: 'Is exactly', querySuffix: '', value: 'exactly' },
    contains: {
      label: 'Contains',
      querySuffix: '_contains',
      value: 'contains',
    },
    startsWith: {
      label: 'Starts with',
      querySuffix: '_starts_with',
      value: 'startsWith',
    },
    endsWith: {
      label: 'Ends with',
      querySuffix: '_ends_with',
      value: 'endsWith',
    },
  },
  inverted: {
    exactly: { label: 'Is not exactly', querySuffix: '_not', value: 'exactly' },
    contains: {
      label: 'Does not contain',
      querySuffix: '_not_contains',
      value: 'contains',
    },
    startsWith: {
      label: 'Does not start with',
      querySuffix: '_not_starts_with',
      value: 'startsWith',
    },
    endsWith: {
      label: 'Does not end with',
      querySuffix: '_not_ends_with',
      value: 'endsWith',
    },
  },
};
function getOptions({ isInverted }) {
  const type = isInverted ? 'inverted' : 'default';
  const optGroup = filterOptions[type];
  const optKeys = Object.keys(optGroup);

  return optKeys.map(k => {
    const opt = optGroup[k];
    return { label: opt.label, value: k };
  });
}
function getOption({ isInverted, key }) {
  const type = isInverted ? 'inverted' : 'default';
  const { label } = filterOptions[type][key];

  return { label, value: key };
}
function getQuery({ field, key, isInverted }) {
  const type = isInverted ? 'inverted' : 'default';
  const suffix = filterOptions[type][key].querySuffix;

  return `${field}${suffix}`;
}

const initialState = {
  field: null,
  filter: filterOptions.default.contains,
  options: getOptions({ isInverted: false }),
  height: 0,
  isInverted: false,
  isCaseSensitive: false,
};

export default class FilterSelect extends Component<SelectProps> {
  state = initialState;

  componentDidUpdate(props, state) {
    if (state.height !== this.state.height) {
      this.scrollToTop();
    }
  }

  // Handlers
  // ==============================

  onSelect = field => {
    this.setState({ field });
    this.fieldSelectRef.blur();
  };
  onSelectFilter = filter => {
    this.setState({ filter });
  };
  onChangeInverted = ({ target }) => {
    const isInverted = target.checked;
    const options = getOptions({ isInverted });
    const filter = getOption({ isInverted, key: this.state.filter.value });

    this.setState({ isInverted, options, filter });
  };
  onChangeCaseSensitivity = ({ target }) => {
    const isCaseSensitive = target.checked;
    this.setState({ isCaseSensitive });
  };

  // Lifecycle
  // ==============================

  focusFieldSelect = () => {
    this.fieldSelectRef.focus();
  };
  focusFilterSelect = () => {
    this.filterSelectRef.focus();
  };
  close = () => {
    this.popoutRef.close();
    this.setState(initialState);
  };
  scrollToTop = () => {
    this.popoutBody.scrollTo(0, 0);
  };

  // Utils
  // ==============================

  clearField = () => {
    this.setState({ field: null });
  };
  getHeight = ref => {
    if (!ref) return;
    this.setState({ height: ref.scrollHeight });
  };

  // Refs
  // ==============================

  getFilterSelect = ref => {
    if (!ref) return;
    this.filterSelectRef = ref;
  };
  getFieldSelect = ref => {
    if (!ref) return;
    this.fieldSelectRef = ref;
  };
  getPopoutRef = ref => {
    if (!ref) return;
    this.popoutRef = ref;
  };
  getPopoutBody = ref => {
    if (!ref) return;
    this.popoutBody = ref;
  };

  // Renderers
  // ==============================

  renderSelect = () => {
    return (
      <Transition
        key="select"
        mountOnEnter
        unmountOnExit
        timeout={220}
        onEntered={this.focusFieldSelect}
      >
        {state => {
          const base = {
            boxSizing: 'border-box',
            padding: POPOUT_GUTTER,
            position: 'absolute',
            width: '100%',
            transition: 'transform 220ms cubic-bezier(0.2, 0, 0, 1)',
          };
          const states = {
            entering: { transform: 'translateX(0)' },
            entered: { transform: 'translateX(0)' },
            exiting: { transform: 'translateX(-100%)' },
            exited: { transform: 'translateX(-100%)' },
          };
          const style = { ...base, ...states[state] };
          return (
            <div style={style} ref={this.getHeight}>
              <FieldAwareSelect
                {...this.props}
                innerRef={this.getFieldSelect}
                key="select"
                onChange={this.onSelect}
                placeholder="What would you like to filter?"
                components={{ Option: FilterOption }}
              />
            </div>
          );
        }}
      </Transition>
    );
  };
  renderFilterUI = () => {
    const { field, filter, isCaseSensitive, isInverted, options } = this.state;
    const filterLabel = `${field.label} ${filter.label.toLowerCase()}${
      isCaseSensitive ? ' (case sensitive)' : ''
    }`;

    return (
      <Transition
        key="filter-ui"
        appear
        mountOnEnter
        unmountOnExit
        timeout={220}
        onEntered={this.focusFilterSelect}
      >
        {state => {
          const base = {
            boxSizing: 'border-box',
            padding: POPOUT_GUTTER,
            position: 'absolute',
            width: '100%',
            transition: 'transform 220ms cubic-bezier(0.2, 0, 0, 1)',
          };
          const states = {
            entering: { transform: 'translateX(0)' },
            entered: { transform: 'translateX(0)' },
            exiting: { transform: 'translateX(100%)' },
            exited: { transform: 'translateX(100%)' },
          };
          const style = { ...base, ...states[state] };
          return (
            <div style={style} ref={this.getHeight}>
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
              <div css={{ marginTop: gridSize }}>
                <Input placeholder={filterLabel} />
              </div>
            </div>
          );
        }}
      </Transition>
    );
  };

  render() {
    const { field, height } = this.state;

    const headerBefore = (
      <Transition
        in={Boolean(field)}
        appear
        mountOnEnter
        unmountOnExit
        timeout={220}
      >
        {state => {
          const base = {
            transition: 'opacity 220ms linear',
          };
          const states = {
            entering: { opacity: 1 },
            entered: { opacity: 1 },
            exiting: { opacity: 0 },
            exited: { opacity: 0 },
          };
          const style = { ...base, ...states[state] };
          return (
            <Back onClick={this.clearField} style={style}>
              <ChevronLeftIcon />
            </Back>
          );
        }}
      </Transition>
    );

    return (
      <Popout
        bodyRef={this.getPopoutBody}
        innerRef={this.getPopoutRef}
        buttonLabel="Filters"
        headerBefore={headerBefore}
        headerTitle={field ? field.label : 'Filter'}
        footerContent={
          field ? (
            <Fragment>
              <FooterButton onClick={this.close} isPrimary>
                Apply
              </FooterButton>
              <FooterButton onClick={this.close}>Cancel</FooterButton>
            </Fragment>
          ) : null
        }
      >
        <div
          css={{
            height,
            position: 'relative',
            transition: 'height 220ms cubic-bezier(0.2, 0, 0, 1)',
          }}
        >
          <TransitionGroup>
            {field ? this.renderFilterUI() : this.renderSelect()}
          </TransitionGroup>
        </div>
      </Popout>
    );
  }
}
