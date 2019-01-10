// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as React from 'react';
import { Children, useMemo } from 'react';
import ReactSelect, { components as reactSelectComponents } from 'react-select';
import {
  CheckboxGroup as _CheckboxGroup,
  Checkbox as _Checkbox,
  RadioGroup as _RadioGroup,
  Radio as _Radio,
} from 'react-radios';

import { colors, gridSize } from '@arch-ui/theme';
import { CheckboxPrimitive, RadioPrimitive } from '@arch-ui/controls';
import { FlexGroup } from '@arch-ui/layout';

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
export const CheckboxGroup = (props: *) => <_CheckboxGroup component={StretchGroup} {...props} />;
const ButtonCheckbox = props => (
  <CheckboxPrimitive components={{ Label: ControlLabel }} {...props} />
);
export const Checkbox = (props: *) => <_Checkbox component={ButtonCheckbox} {...props} />;

// radio
export const RadioGroup = (props: *) => <_RadioGroup component={StretchGroup} {...props} />;
const ButtonRadio = props => <RadioPrimitive components={{ Label: ControlLabel }} {...props} />;
export const Radio = (props: *) => <_Radio component={ButtonRadio} {...props} />;

type OptionPrimitiveProps = {
  children: React.Node,
  isDisabled: boolean,
  isFocused: boolean,
  isSelected: boolean,
  innerProps: Object,
};

export const OptionPrimitive = ({
  children,
  isDisabled,
  isFocused,
  isSelected,
  innerProps: { innerRef, ...innerProps },
}: OptionPrimitiveProps) => {
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

type OptionRendererProps = {
  components?: $Shape<typeof reactSelectComponents>,
  displaySearch: boolean,
  innerRef: ?React.Ref<*>,
};

export const OptionRenderer = ({
  displaySearch,
  innerRef,
  components: propComponents,
  ...props
}: OptionRendererProps) => {
  const components = useMemo(
    () => ({
      ...defaultComponents,
      ...propComponents,
    }),
    [propComponents]
  );

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
      components={components}
    />
  );
};

OptionRenderer.defaultProps = {
  displaySearch: true,
};
