/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, createRef } from 'react';
import { Transition, TransitionGroup } from 'react-transition-group';

import { ChevronLeftIcon, ChevronRightIcon, AlertIcon } from '@voussoir/icons';
import { colors, gridSize } from '@arch-ui/theme';
import { A11yText } from '@arch-ui/typography';
import { Alert } from '@arch-ui/alert';
import { OptionPrimitive } from '@arch-ui/filters';
import Select from '@arch-ui/select';

import FieldSelect from '../FieldSelect';
import PopoutForm from './PopoutForm';
import { POPOUT_GUTTER } from '../../../components/Popout';

// This import is loaded by the @voussoir/field-views-loader loader.
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

export const FieldOption = ({ children, ...props }) => {
  let iconColor = !props.isFocused && !props.isSelected ? colors.N40 : 'currentColor';

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

  // Refs
  // ==============================

  fieldSelectRef = createRef();
  filterSelectRef = createRef();
  filterRef = createRef();

  // Utils
  // ==============================

  resetState = () => {
    this.setState(getInitialState());
  };
  matchesExistingFilterType = opt => {
    const { existingFilters } = this.props;
    const { field } = this.state;

    const matches = field
      ? x => x.field.path === field.path && x.type === opt.type
      : x => x.type === opt.type;

    return existingFilters.some(matches);
  };
  getExistingFieldFilters = field => {
    const { existingFilters } = this.props;
    return existingFilters.filter(x => x.field.path === field.path);
  };
  availableFieldFilterTypes = field => {
    // we only care about filters on the selected field
    const existingFieldFilters = this.getExistingFieldFilters(field);

    // bail quickly if possibly
    if (field.getFilterTypes().length === existingFieldFilters.length) {
      return [];
    }

    // create a diff of existing filters VS selected field filters
    return field.getFilterTypes().filter(x => {
      return !existingFieldFilters.filter(y => y.type === x.type).length;
    });
  };
  hasAvailableFilterTypes = field => {
    if (!field.getFilterTypes()) return false;
    return Boolean(this.availableFieldFilterTypes(field).length);
  };
  doesNotHaveAvailableFilterTypes = field => {
    return !this.hasAvailableFilterTypes(field);
  };
  firstAvailableFilterType = field => {
    const available = this.availableFieldFilterTypes(field);
    return available[0];
  };

  // Handlers
  // ==============================

  onFieldChange = field => {
    if (!field) return;

    // preset the initial filter/value if available
    const filter = this.firstAvailableFilterType(field);
    const value = filter ? filter.getInitialValue() : undefined;

    this.setState({ field, filter, value });
    this.fieldSelectRef.current.blur();
  };
  onTypeChange = filter => {
    this.setState({ filter });
    this.focusFilterRef();
  };
  onChangeFilter = value => {
    this.setState({ value });
  };
  onSubmit = event => {
    const { onChange } = this.props;
    const { field, filter, value } = this.state;

    event.preventDefault();
    if (!filter || value === null) return;

    onChange({ field, label: filter.label, type: filter.type, value });
  };

  // Lifecycle
  // ==============================

  focusFieldSelect = () => {
    if (!this.fieldSelectRef.current) return;
    this.fieldSelectRef.current.focus();
  };
  focusFilterSelect = () => {
    if (!this.filterSelectRef.current) return;
    this.filterSelectRef.current.focus();
  };
  focusFilterRef = () => {
    if (!this.filterRef.current) return;
    this.filterRef.current.focus();
  };

  // Renderers
  // ==============================

  getFieldOptions = () => {
    const { fields } = this.props;
    return fields.filter(f => f.getFilterTypes() && f.getFilterTypes().length);
  };
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
              <FieldSelect
                fields={this.getFieldOptions()}
                isOptionDisabled={this.doesNotHaveAvailableFilterTypes}
                innerRef={this.fieldSelectRef}
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
    const { field, filter } = this.state;
    const options = field.getFilterTypes();

    return (
      <Transition
        key="filter-ui"
        mountOnEnter
        unmountOnExit
        timeout={220}
        onEntered={filter ? this.focusFilterRef : this.focusFilterSelect}
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
                    getOptionValue={opt => opt.type}
                    innerRef={this.filterSelectRef}
                    isOptionDisabled={this.matchesExistingFilterType}
                    menuPortalTarget={document.body}
                    onChange={this.onTypeChange}
                    options={options}
                    value={filter}
                  />
                </EventCatcher>
              ) : null}
              <Filter
                innerRef={this.filterRef}
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
      <PopoutForm
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
      </PopoutForm>
    );
  }
}
