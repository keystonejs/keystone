/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, createRef, Suspense } from 'react';
import { Transition, TransitionGroup } from 'react-transition-group';

import { ChevronLeftIcon, ChevronRightIcon, AlertIcon } from '@arch-ui/icons';
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

let Render = ({ children }) => children();

const AddFilterPopout = ({ fields, existingFilters, onChange }) => {
  const [field, setField] = useState(null);
  const [filter, setFilter] = useState(null);
  const [value, setValue] = useState('');

  // Refs
  // ==============================

  const fieldSelectRef = createRef();
  const filterSelectRef = createRef();
  const filterRef = createRef();

  // Utils
  // ==============================

  const resetState = () => {
    setField(null);
    setFilter(null);
    setValue('');
  };

  const matchesExistingFilterType = opt => {
    const matches = field
      ? x => x.field.path === field.path && x.type === opt.type
      : x => x.type === opt.type;

    return existingFilters.some(matches);
  };

  const getExistingFieldFilters = field => {
    return existingFilters.filter(x => x.field.path === field.path);
  };

  const availableFieldFilterTypes = field => {
    // we only care about filters on the selected field
    const existingFieldFilters = getExistingFieldFilters(field);

    // bail quickly if possibly
    if (field.getFilterTypes().length === existingFieldFilters.length) {
      return [];
    }

    // create a diff of existing filters VS selected field filters
    return field.getFilterTypes().filter(x => {
      return !existingFieldFilters.filter(y => y.type === x.type).length;
    });
  };

  const hasAvailableFilterTypes = field => {
    if (!field.getFilterTypes()) return false;
    return Boolean(availableFieldFilterTypes(field).length);
  };

  const doesNotHaveAvailableFilterTypes = field => {
    return !hasAvailableFilterTypes(field);
  };

  const firstAvailableFilterType = field => {
    const available = availableFieldFilterTypes(field);
    return available[0];
  };

  // Handlers
  // ==============================

  const onFieldChange = field => {
    if (!field) return;

    // preset the initial filter/value if available
    const filter = firstAvailableFilterType(field);
    const value = filter ? filter.getInitialValue() : undefined;

    setField(field);
    setFilter(filter);
    setValue(value);

    fieldSelectRef.current.blur();
  };

  const onTypeChange = filter => {
    setFilter(filter);
    focusFilterRef();
  };

  const onChangeFilter = value => {
    setValue(value);
  };

  const onSubmit = event => {
    event.preventDefault();
    if (!filter || value === null) return;

    onChange({ field, label: filter.label, type: filter.type, value });
  };

  // Lifecycle
  // ==============================

  const focusFieldSelect = () => {
    if (!fieldSelectRef.current) return;
    fieldSelectRef.current.focus();
  };

  const focusFilterSelect = () => {
    if (!filterSelectRef.current) return;
    filterSelectRef.current.focus();
  };

  const focusFilterRef = () => {
    if (!filterRef.current) return;
    filterRef.current.focus();
  };

  // Renderers
  // ==============================

  const getFieldOptions = () => {
    return fields.filter(f => f.getFilterTypes() && f.getFilterTypes().length);
  };

  const renderFieldSelect = ({ ref }) => {
    return (
      <Transition
        key="select"
        mountOnEnter
        unmountOnExit
        timeout={220}
        onEntered={focusFieldSelect}
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
          fields[0].adminMeta.preloadViews(fields.map(({ views }) => views.Filter).filter(x => x));

          const style = { ...base, ...states[state] };
          return (
            <div ref={ref} style={style}>
              <FieldSelect
                fields={getFieldOptions()}
                isOptionDisabled={doesNotHaveAvailableFilterTypes}
                innerRef={fieldSelectRef}
                onChange={onFieldChange}
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

  const renderFilterUI = ({ ref }) => {
    const options = field.getFilterTypes();

    return (
      <Transition
        key="filter-ui"
        mountOnEnter
        unmountOnExit
        timeout={220}
        onEntered={filter ? focusFilterRef : focusFilterSelect}
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
                    innerRef={filterSelectRef}
                    isOptionDisabled={matchesExistingFilterType}
                    menuPortalTarget={document.body}
                    onChange={onTypeChange}
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
                        innerRef={filterRef}
                        field={field}
                        filter={filter}
                        value={value}
                        onChange={onChangeFilter}
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

  const back = <BackButton show={!!field} onClick={resetState} />;

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
      onSubmit={onSubmit}
      onClose={resetState}
    >
      {({ ref }) => (
        <TransitionGroup component={null}>
          {field ? renderFilterUI({ ref }) : renderFieldSelect({ ref })}
        </TransitionGroup>
      )}
    </PopoutForm>
  );
};

export default AddFilterPopout;
