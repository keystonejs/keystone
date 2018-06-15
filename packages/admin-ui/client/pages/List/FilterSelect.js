import React, { Component, Fragment } from 'react';
import { Transition, TransitionGroup } from 'react-transition-group';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  AlertIcon,
} from '@keystonejs/icons';
import { colors, gridSize } from '@keystonejs/ui/src/theme';
import { A11yText } from '@keystonejs/ui/src/primitives/typography';
import { Alert } from '@keystonejs/ui/src/primitives/alert';

import FieldAwareSelect, { type SelectProps } from './FieldAwareSelect';
import OptionRenderer from './OptionRenderer';
import { OptionPrimitive } from './components';
import { getInvertedOption, getOption, getOptions, getQuery } from './filters';
import { Popout, POPOUT_GUTTER } from '../../components/Popout';
import AnimateHeight from '../../components/AnimateHeight';

// This import is loaded by the @keystone/field-views-loader loader.
// It imports all the views required for a keystone app by looking at the adminMetaData
import FieldTypes from '../../FIELD_TYPES';

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
  <button
    css={{
      background: 0,
      border: 0,
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

const initialState = {
  field: null,
  filter: getOption({ isInverted: false, key: '_contains' }),
  height: 0,
  inputValue: '',
  isCaseSensitive: false,
  isInverted: false,
  options: getOptions({ isInverted: false }),
  filterValue: null,
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

  onSelectField = field => {
    this.setState({ field });
    this.fieldSelectRef.blur();
  };
  onChangeFilter = filterValue => {
    this.setState({ filterValue });
  };
  onSubmit = event => {
    const { onChange } = this.props;
    const { filterValue } = this.state;

    this.close(event);
    onChange(filterValue);
  };

  // Lifecycle
  // ==============================

  focusFieldSelect = () => {
    this.fieldSelectRef.focus();
  };
  focusFilterSelect = () => {
    this.filterSelectRef.focus();
  };
  close = event => {
    if (event) event.preventDefault();

    this.popoutRef.close();
    // this.setState(initialState);
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

  renderFieldSelect = () => {
    return (
      <Transition
        key="select"
        mountOnEnter
        unmountOnExit
        timeout={220}
        onEntering={this.focusFieldSelect}
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
                onChange={this.onSelectField}
                placeholder="What would you like to filter?"
                components={{ Option: FilterOption }}
                value={[]}
              />
            </div>
          );
        }}
      </Transition>
    );
  };
  renderFilterUI = () => {
    const { list } = this.props;
    const { field } = this.state;

    return (
      <Transition
        key="filter-ui"
        mountOnEnter
        unmountOnExit
        timeout={220}
        // onEntering={this.focusFilterSelect}
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
          const { Filter } = FieldTypes[list.key][field.path];
          const Code = p => (
            <code
              css={{
                background: 'rgba(0,0,0,0.1)',
                padding: '1px 5px',
                borderRadius: 2,
              }}
              {...p}
            />
          );

          if (!Filter) {
            return (
              <div style={style} ref={this.getHeight}>
                <Alert appearance="warning" variant="bold">
                  <AlertIcon
                    css={{
                      height: 24,
                      width: 24,
                      marginLeft: -8,
                      marginRight: 12,
                    }}
                  />
                  <div css={{ fontSize: '0.85em', lineHeight: 1.4 }}>
                    Could not find a <Code>Filter</Code> view for field type{' '}
                    <Code>{field.type}</Code>.
                  </div>
                </Alert>
              </div>
            );
          }

          return (
            <div style={style} ref={this.getHeight}>
              <Filter
                list={list}
                field={field}
                onChange={this.onChangeFilter}
              />
            </div>
          );
        }}
      </Transition>
    );
  };

  renderFooter() {
    const { list } = this.props;
    const { field } = this.state;

    // bail early
    if (!field) return null;

    const { Filter } = FieldTypes[list.key][field.path];

    return Filter ? (
      <Fragment>
        <FooterButton onClick={this.onApply} isPrimary>
          Apply
        </FooterButton>
        <FooterButton onClick={this.close}>Cancel</FooterButton>
      </Fragment>
    ) : null;
  }
  popoutForm = props => {
    return <form onSubmit={this.onSubmit} {...props} />;
  };

  render() {
    const { field } = this.state;

    const headerBefore = (
      <Transition in={Boolean(field)} mountOnEnter unmountOnExit timeout={220}>
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
        component={this.popoutForm}
        bodyRef={this.getPopoutBody}
        innerRef={this.getPopoutRef}
        buttonLabel="Filters"
        headerBefore={headerBefore}
        headerTitle={field ? field.label : 'Filter'}
        footerContent={this.renderFooter()}
      >
        <AnimateHeight style={{ position: 'relative' }} initial="auto">
          <TransitionGroup component={null}>
            {field ? this.renderFilterUI() : this.renderFieldSelect()}
          </TransitionGroup>
        </AnimateHeight>
      </Popout>
    );
  }
}
