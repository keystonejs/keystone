// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as React from 'react';
import { useMemo } from 'react';
import ReactSelect, { components as reactSelectComponents } from 'react-select';
import { colors, gridSize } from '@arch-ui/theme';
import { alpha } from '@arch-ui/color-utils';

// ==============================
// Controls
// ==============================

const Checkbox = () => (
  <svg width="24" height="24" focusable="false" role="presentation">
    <g fillRule="evenodd">
      <rect
        className="checkbox-rect"
        fill="currentColor"
        x="6"
        y="6"
        width="12"
        height="12"
        rx="2"
      />
      <path
        className="checkbox-mark"
        d="M9.707 11.293a1 1 0 1 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 1 0-1.414-1.414L11 12.586l-1.293-1.293z"
        fill="inherit"
      />
    </g>
  </svg>
);

// ==============================
// Primitives
// ==============================

type OptionPrimitiveProps = {
  children: React.Node,
  isDisabled: boolean,
  isFocused: boolean,
  isSelected: boolean,
  innerProps: Object,
};

export const OptionPrimitive = ({
  children,
  hasCheckbox = true,
  isDisabled,
  isFocused,
  isSelected,
  innerProps,
  innerRef,
}: OptionPrimitiveProps) => {
  const focusedStyles =
    isFocused && !isDisabled
      ? {
          backgroundColor: alpha(colors.primary, 0.04),

          '.checkbox-rect': {
            fill: isSelected ? colors.B.L10 : colors.N15,
          },
        }
      : null;

  return (
    <div
      ref={innerRef}
      css={{
        alignItems: 'center',
        // backgroundColor: alpha(colors.N100, 0.03),
        borderRadius: 3,
        color: isDisabled ? colors.N60 : null,
        cursor: 'pointer',
        display: 'flex',
        fontSize: '0.9em',
        height: '1.6rem',
        lineHeight: '1.5rem',
        marginBottom: 4,
        opacity: isDisabled ? 0.6 : null,
        outline: 0,
        padding: gridSize / 2,
        pointerEvents: isDisabled ? 'none' : null,

        '.checkbox-rect': {
          fill: isSelected ? colors.primary : colors.N10,
        },
        '.checkbox-mark': {
          fill: isSelected ? 'white' : 'transparent',
        },

        ':active': {
          backgroundColor: alpha(colors.primary, 0.08),

          '.checkbox-rect': {
            fill: isSelected ? colors.B.D10 : colors.N20,
          },
          '.checkbox-mark': {
            fill: isSelected ? 'white' : colors.N40,
          },
        },

        ...focusedStyles,
      }}
      {...innerProps}
    >
      {hasCheckbox ? <Checkbox /> : null}
      {children}
    </div>
  );
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

const styles = {
  control: (base, { isFocused }) => ({
    ...base,
    backgroundColor: isFocused ? alpha(colors.N100, 0.08) : alpha(colors.N100, 0.04),
    boxShadow: 'none',
    border: 0,
    fontSize: '0.9rem',
    outline: 0,
    ':hover': { borderColor: isFocused ? colors.primary : colors.N20 },
  }),
  menu: () => ({ marginTop: 8 }),
  menuList: provided => ({ ...provided, padding: 0 }),
};

const defaultComponents = {
  Control,
  Option: OptionPrimitive,
  DropdownIndicator: null,
  IndicatorSeparator: null,
};

type OptionsProps = {
  components?: $Shape<typeof reactSelectComponents>,
  displaySearch: boolean,
  innerRef: ?React.Ref<*>,
};

export const Options = ({
  displaySearch,
  innerRef,
  components: propComponents,
  ...props
}: OptionsProps) => {
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
      styles={styles}
      // TODO: JW: Not a fan of this, but it doesn't seem to make a difference
      // if we take it out. react-select bug maybe?
      tabSelectsValue={false}
      {...props}
      components={components}
    />
  );
};

Options.defaultProps = {
  displaySearch: true,
};
