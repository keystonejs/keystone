/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Children, Component } from 'react';
import ReactSelect, { components as reactSelectComponents } from 'react-select';
import {
  CheckboxGroup as _CheckboxGroup,
  Checkbox as _Checkbox,
  RadioGroup as _RadioGroup,
  Radio as _Radio,
} from 'react-radios';

import { colors, gridSize } from '../theme';
import { CheckboxPrimitive, RadioPrimitive } from './forms';
import { FlexGroup } from './layout';

// ==============================
// Styled Select
// ==============================

const indicatorStyles = (provided, { isDisabled, isFocused }) => {
  let styles = {
    color: colors.N20,
    ':hover': !isDisabled && !isFocused ? { color: colors.N40 } : null,
  };
  if (isDisabled) styles = { color: colors.N10 };
  if (isFocused) {
    styles = { color: colors.N60, ':hover': { color: colors.N80 } };
  }
  return {
    ...provided,
    ...styles,
  };
};
const selectStyles = {
  control: (provided, { isFocused }) => {
    const focusStyles = isFocused
      ? {
          borderColor: colors.primary,
          boxShadow: `inset 0 1px 1px rgba(0, 0, 0, 0.075),
      0 0 0 3px ${colors.B.A20}`,
          outline: 0,
        }
      : null;
    return {
      ...provided,
      backgroundColor: 'white',
      borderColor: colors.N20,
      fontSize: '0.9em',
      minHeight: 35,
      minWidth: '200px',
      ':hover': { borderColor: colors.N30 },
      ...focusStyles,
    };
  },
  clearIndicator: indicatorStyles,
  dropdownIndicator: indicatorStyles,
  menu: p => ({ ...p, fontSize: '0.9em' }),
  option: (p, { isDisabled, isFocused, isSelected }) => {
    let bg = 'inherit';
    if (isFocused) bg = colors.B.L90;
    if (isSelected) bg = colors.primary;

    let txt = 'inherit';
    if (isFocused) txt = colors.primary;
    if (isSelected) txt = 'white';
    if (isDisabled) txt = colors.N40;

    const cssPseudoActive =
      !isSelected && !isDisabled
        ? {
            backgroundColor: colors.B.L80,
            color: colors.B.D20,
          }
        : {};

    return {
      ...p,
      backgroundColor: bg,
      color: txt,

      ':active': cssPseudoActive,
    };
  },
  menuPortal: p => ({ ...p, zIndex: 3 }),
};
export const Select = ({ innerRef, ...props }) => (
  <ReactSelect ref={innerRef} styles={selectStyles} {...props} />
);

// ==============================
// Control Stuff
// ==============================

const ControlLabel = ({ isChecked, isDisabled, ...props }) => {
  const type = Children.toArray(props.children)[0].props.type;
  const borderRadius = type === 'checkbox' ? 3 : '2em';

  return (
    <label
      css={{
        alignItems: 'center',
        border: `1px solid ${colors.N10}`,
        borderRadius,
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
const StretchGroup = props => <FlexGroup stretch {...props} />;

// checkbox
export const CheckboxGroup = props => <_CheckboxGroup component={StretchGroup} {...props} />;
const ButtonCheckbox = props => (
  <CheckboxPrimitive components={{ Label: ControlLabel }} {...props} />
);
export const Checkbox = props => <_Checkbox component={ButtonCheckbox} {...props} />;

// radio
export const RadioGroup = props => <_RadioGroup component={StretchGroup} {...props} />;
const ButtonRadio = props => <RadioPrimitive components={{ Label: ControlLabel }} {...props} />;
export const Radio = props => <_Radio component={ButtonRadio} {...props} />;

// ==============================
// Select Stuff
// ==============================

export const OptionPrimitive = ({
  children,
  isDisabled,
  isFocused,
  isSelected,
  innerProps: { innerRef, ...innerProps },
}) => {
  const hoverAndFocusStyles = {
    backgroundColor: colors.B.L90,
    color: colors.primary,
  };
  const focusedStyles = isFocused && !isDisabled ? hoverAndFocusStyles : null;
  const selectedStyles =
    isSelected && !isDisabled
      ? {
          '&, &:hover, &:focus, &:active': {
            backgroundColor: colors.primary,
            color: 'white',
          },
        }
      : null;

  return (
    <div
      ref={innerRef}
      css={{
        alignItems: 'center',
        backgroundColor: colors.N05,
        borderRadius: 3,
        color: isDisabled ? colors.N60 : null,
        cursor: 'pointer',
        display: 'flex',
        fontSize: '0.9em',
        justifyContent: 'space-between',
        marginBottom: 4,
        opacity: isDisabled ? 0.6 : null,
        outline: 0,
        padding: `${gridSize}px ${gridSize * 1.5}px`,
        pointerEvents: isDisabled ? 'none' : null,

        ':active': {
          backgroundColor: colors.B.L80,
          color: colors.primary,
        },

        ...focusedStyles,
        ...selectedStyles,
      }}
      {...innerProps}
    >
      {children}
    </div>
  );
};

const optionRendererStyles = {
  ...selectStyles,
  menu: () => ({ marginTop: 8 }),
  menuList: provided => ({ ...provided, padding: 0 }),
};

const Control = ({ selectProps, ...props }) => {
  return selectProps.shouldDisplaySearchControl ? (
    <reactSelectComponents.Control {...props} />
  ) : (
    <div
      css={{
        border: 0,
        clip: 'rect(1px, 1px, 1px, 1px)',
        height: 1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        whiteSpace: 'nowrap',
        width: 1,
      }}
    >
      <reactSelectComponents.Control {...props} />
    </div>
  );
};

const defaultComponents = {
  Control,
  Option: OptionPrimitive,
  DropdownIndicator: null,
  IndicatorSeparator: null,
};

export class OptionRenderer extends Component {
  constructor(props) {
    super(props);
    this.cacheComponents(props.components);
  }
  static defaultProps = { displaySearch: true };
  componentWillReceiveProps(nextProps) {
    if (nextProps.components !== this.props.components) {
      this.cacheComponents(nextProps.components);
    }
  }
  cacheComponents = (components?: {}) => {
    this.components = {
      ...defaultComponents,
      ...components,
    };
  };
  render() {
    const { displaySearch, innerRef, ...props } = this.props;
    return (
      <ReactSelect
        backspaceRemovesValue={false}
        captureMenuScroll={false}
        closeMenuOnSelect={false}
        controlShouldRenderValue={false}
        hideSelectedOptions={false}
        isClearable={false}
        isSearchable={displaySearch}
        maxMenuHeight={1000}
        menuIsOpen
        menuShouldScrollIntoView={false}
        ref={innerRef}
        shouldDisplaySearchControl={displaySearch}
        styles={optionRendererStyles}
        // TODO: JW: Not a fan of this, but it doesn't seem to make a difference
        // if we take it out. react-select bug maybe?
        tabSelectsValue={false}
        {...props}
        components={this.components}
      />
    );
  }
}
