/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, createRef, Suspense } from 'react';
import { Transition, TransitionGroup } from 'react-transition-group';

import { ChevronLeftIcon, ChevronRightIcon, AlertIcon } from '@primer/octicons-react';
import { colors, gridSize } from '@arch-ui/theme';
import { A11yText } from '@arch-ui/typography';
import { Alert } from '@arch-ui/alert';
import { Button } from '@arch-ui/button';
import { OptionPrimitive } from '@arch-ui/options';
import Select from '@arch-ui/select';
import { LoadingSpinner } from '@arch-ui/loading';

import FieldSelect from '../FieldSelect';
import PopoutForm from './PopoutForm';
import { DisclosureArrow, POPOUT_GUTTER } from '../../../components/Popout';
import { ErrorBoundary } from '../../../components/ErrorBoundary';

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
  let iconColor = colors.N20;
  if (props.isFocused) iconColor = colors.text;

  return (
    <OptionPrimitive {...props}>
      <span>{children}</span>
      <div
        css={{
          alignItems: 'center',
          display: 'flex',
          height: 24,
          justifyContent: 'center',
          width: 24,
        }}
      >
        <ChevronRightIcon css={{ color: iconColor }} />
      </div>
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

let Render = ({ children }) => children();

export default class AddFilterPopout extends Component {
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
    if (!filter || field.getFilterValue(value) === undefined) return;

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
          this.props.fields[0].preloadViews(
            this.props.fields.map(({ views }) => views.Filter).filter(x => x)
          );

          const style = { ...base, ...states[state] };
          return (
            <div ref={ref} style={style}>
              <FieldSelect
                fields={this.getFieldOptions()}
                isOptionDisabled={this.doesNotHaveAvailableFilterTypes}
                innerRef={this.fieldSelectRef}
                onChange={this.onFieldChange}
                placeholder="Search fields..."
                components={{ Option: FieldOption }}
                value={[]}
              />
            </div>
          );
        }}
      </Transition>
    );
  };
  renderFilterUI = ({ ref }) => {
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

          if (!field.views.Filter) {
            return (
              <div ref={ref} style={style}>
                <Alert appearance="warning" variant="bold">
                  <AlertIcon
                    size={24}
                    css={{
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
              <Suspense
                fallback={
                  <div css={{ display: 'flex', justifyContent: 'center' }}>
                    <LoadingSpinner size={32} />
                  </div>
                }
              >
                <Render>
                  {() => {
                    const [Filter] = field.readViews([field.views.Filter]);

                    return (
                      <ErrorBoundary>
                        <Filter
                          innerRef={this.filterRef}
                          field={field}
                          filter={filter}
                          value={this.state.value}
                          onChange={this.onChangeFilter}
                        />
                      </ErrorBoundary>
                    );
                  }}
                </Render>
              </Suspense>
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
        target={handlers => (
          <Button
            variant="subtle"
            appearance="primary"
            spacing="cozy"
            css={{ marginBottom: gridSize / 2, marginTop: gridSize / 2 }}
            {...handlers}
          >
            Filters
            <DisclosureArrow />
          </Button>
        )}
        headerBefore={back}
        headerTitle={field ? field.label : 'Filter'}
        showFooter={!!field}
        onSubmit={this.onSubmit}
        onClose={this.resetState}
      >
        {({ ref }) => (
          <TransitionGroup component={null}>
            {field ? this.renderFilterUI({ ref }) : this.renderFieldSelect({ ref })}
          </TransitionGroup>
        )}
      </PopoutForm>
    );
  }
}
