/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, createRef, Suspense } from 'react';
import { Transition, TransitionGroup } from 'react-transition-group';

import { ChevronLeftIcon, ChevronRightIcon, AlertIcon } from '@arch-ui/icons';
import { Pill } from '@arch-ui/pill';
import { colors, gridSize } from '@arch-ui/theme';
import { A11yText } from '@arch-ui/typography';
import { Alert } from '@arch-ui/alert';
import { OptionPrimitive } from '@arch-ui/options';
import Select from '@arch-ui/select';
import { LoadingSpinner } from '@arch-ui/loading';

import FieldSelect from '../FieldSelect';
import PopoutForm from './PopoutForm';
import { POPOUT_GUTTER } from '../../../components/Popout';

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
    <OptionPrimitive hasCheckbox={false} {...props}>
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

let Render = ({ children }) => children();

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
          this.props.fields[0].adminMeta.preloadViews(
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
              <Suspense
                fallback={
                  <div css={{ display: 'flex', justifyContent: 'center' }}>
                    <LoadingSpinner size={32} />
                  </div>
                }
              >
                <Render>
                  {() => {
                    let [Filter] = field.adminMeta.readViews([field.views.Filter]);

                    return (
                      <Filter
                        innerRef={this.filterRef}
                        field={field}
                        filter={filter}
                        value={this.state.value}
                        onChange={this.onChangeFilter}
                      />
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
        target={targetProps => (
          <Pill
            appearance="primary"
            // nuanced
            // variant="bold"
            css={{ marginBottom: 4, marginLeft: 4 }}
            {...targetProps}
          >
            <div
              css={{
                alignItems: 'center',
                display: 'flex',
                height: 30,
                justifyContent: 'center',
                marginTop: 2,
                width: '2rem',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 125" width="12" height="15">
                <path
                  fill="currentColor"
                  d="M93.111 7.647c-.697-1.744-1.908-2.617-3.641-2.617H10.528c-1.725 0-2.94.874-3.64 2.617-.699 1.833-.41 3.397.865 4.694l30.406 33.07v28.166c0 1.162.391 2.173 1.17 3.021l15.793 17.168c.736.853 1.662 1.279 2.773 1.279.492 0 1.008-.114 1.543-.338 1.604-.76 2.406-2.078 2.406-3.957V45.412l30.408-33.07c1.275-1.298 1.557-2.862.859-4.695z"
                />
              </svg>
              <DisclosureArrow />
            </div>
            {/* Filter
            <DisclosureArrow css={{ marginTop: 3 }} /> */}
          </Pill>
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

// Other
export const DisclosureArrow = ({ size = '0.3em', ...props }) => (
  <span
    css={{
      borderLeft: `${size} solid transparent`,
      borderRight: `${size} solid transparent`,
      borderTop: `${size} solid`,
      display: 'inline-block',
      height: 0,
      marginLeft: '0.33em',
      marginTop: '-0.125em',
      verticalAlign: 'middle',
      width: 0,
    }}
    {...props}
  />
);
