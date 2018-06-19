import React, { Component } from 'react';
import { Transition, TransitionGroup } from 'react-transition-group';

import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AlertIcon,
} from '@keystonejs/icons';
import { colors, gridSize } from '@keystonejs/ui/src/theme';
import { A11yText } from '@keystonejs/ui/src/primitives/typography';
import { Alert } from '@keystonejs/ui/src/primitives/alert';
import { Select } from '@keystonejs/ui/src/primitives/filters';

import FieldAwareSelect from '../FieldAwareSelect';
import { OptionPrimitive } from '../components';
import FilterPopout from './FilterPopout';
import { POPOUT_GUTTER } from '../../../components/Popout';

// This import is loaded by the @keystone/field-views-loader loader.
// It imports all the views required for a keystone app by looking at the adminMetaData
import FieldTypes from '../../../FIELD_TYPES';

const EventCatcher = props => (
  <div
    onClick={e => {
      e.preventDefault();
      e.stopPropagation();
    }}
    css={{ marginBottom: gridSize }}
    {...props}
  />
);

function formatFilterTypeLabel({ isDisabled, label }) {
  return isDisabled ? (
    <div css={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>{label}</span>
      <CheckIcon />
    </div>
  ) : (
    label
  );
}

export const FieldOption = ({ children, ...props }) => {
  let iconColor =
    !props.isFocused && !props.isSelected ? colors.N40 : 'currentColor';

  return (
    <OptionPrimitive {...props}>
      <span>{children}</span>
      <ChevronRightIcon css={{ color: iconColor }} />
    </OptionPrimitive>
  );
};

const BackButton = ({ show, onClick }) => (
  <Transition in={show} mountOnEnter unmountOnExit timeout={220}>
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
        <div
          css={{
            cursor: 'pointer',
            marginLeft: -gridSize,
            padding: gridSize,
          }}
          role="button"
          onClick={onClick}
          style={style}
        >
          <ChevronLeftIcon />
          <A11yText>Back to Fields</A11yText>
        </div>
      );
    }}
  </Transition>
);

function getInitialState() {
  return {
    field: null,
    filter: null,
    value: '',
  };
}

type Props = {
  existingFilters: Array<Object>,
};
type State = {
  field: Object,
  filter: Object,
  value: string,
};

export default class AddFilterPopout extends Component<Props, State> {
  state = getInitialState();

  // Handlers
  // ==============================

  onFieldChange = field => {
    if (!field) return;
    this.setState({ field });
    this.fieldSelectRef.blur();
  };
  onTypeChange = filter => {
    this.setState({ filter });
  };
  onChangeFilter = event => {
    this.setState({ value: event.target.value });
  };
  onSubmit = event => {
    const { onChange } = this.props;
    const { field, filter, value } = this.state;

    event.preventDefault();
    if (!filter) return;

    onChange({ field, label: filter.label, type: filter.type, value });
  };

  // Lifecycle
  // ==============================

  focusFieldSelect = () => {
    this.fieldSelectRef.focus();
  };
  focusFilterRef = () => {
    if (!this.filterRef || !this.filterRef.focus) return;
    this.filterRef.focus();
  };

  // Utils
  // ==============================

  resetState = () => {
    this.setState(getInitialState());
  };

  // Refs
  // ==============================

  getFilterRef = ref => {
    if (!ref) return;
    this.filterRef = ref;
  };
  getFieldSelect = ref => {
    if (!ref) return;
    this.fieldSelectRef = ref;
  };

  // Renderers
  // ==============================

  renderFieldSelect = ({ ref }) => {
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
            <div ref={ref} style={style}>
              <FieldAwareSelect
                {...this.props}
                innerRef={this.getFieldSelect}
                onChange={this.onFieldChange}
                placeholder="What would you like to filter?"
                components={{ Option: FieldOption }}
                value={[]}
              />
            </div>
          );
        }}
      </Transition>
    );
  };
  renderFilterUI = ({ ref, recalcHeight }) => {
    const { existingFilters } = this.props;
    const { field, filter } = this.state;

    const options = field.filterTypes.map(f => {
      const matches = e => e.field.path === field.path && e.type === f.type;
      const isDisabled = existingFilters.some(matches);
      return { ...f, isDisabled };
    });

    return (
      <Transition
        key="filter-ui"
        mountOnEnter
        unmountOnExit
        timeout={220}
        onEntered={this.focusFilterRef}
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
          const { Filter } = FieldTypes[field.list.key][field.path];
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
              <div ref={ref} style={style}>
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
            <div ref={ref} style={style}>
              {options.length > 1 ? (
                <EventCatcher>
                  <Select
                    // autoFocus
                    innerRef={this.getFilterRef}
                    defaultIsOpen
                    getOptionValue={opt => opt.type}
                    // menuPosition="fixed"
                    // menuIsOpen
                    menuPortalTarget={document.body}
                    options={options}
                    formatOptionLabel={formatFilterTypeLabel}
                    onChange={this.onTypeChange}
                    value={filter}
                  />
                </EventCatcher>
              ) : null}
              <Filter
                recalcHeight={recalcHeight}
                field={field}
                filter={filter}
                value={this.state.value}
                onChange={this.onChangeFilter}
              />
            </div>
          );
        }}
      </Transition>
    );
  };

  render() {
    const { field } = this.state;
    const back = <BackButton show={!!field} onClick={this.resetState} />;

    return (
      <FilterPopout
        buttonLabel="Filters"
        headerBefore={back}
        headerTitle={field ? field.label : 'Filter'}
        showFooter={!!field}
        onSubmit={this.onSubmit}
        onClose={this.resetState}
      >
        {({ ref, recalcHeight }) => (
          <TransitionGroup component={null}>
            {field
              ? this.renderFilterUI({ ref, recalcHeight })
              : this.renderFieldSelect({ ref, recalcHeight })}
          </TransitionGroup>
        )}
      </FilterPopout>
    );
  }
}
