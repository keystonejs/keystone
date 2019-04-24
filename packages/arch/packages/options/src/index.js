// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as React from 'react';
import { useMemo } from 'react';
import ReactSelect, { components as reactSelectComponents } from 'react-select';
import { CheckIcon } from '@arch-ui/icons';
import { colors, gridSize } from '@arch-ui/theme';
import { uniformHeight } from '@arch-ui/common';

type Props = {
  isDisabled?: boolean,
  isFocused?: boolean,
  isSelected?: boolean,
};

export const CheckMark = ({ isDisabled, isFocused, isSelected }: Props) => {
  let bg;
  let fg;
  let border;
  let size = 24;

  if (isDisabled) {
    bg = isSelected ? colors.N20 : colors.N10;
    fg = isSelected ? 'white' : colors.N10;
    border = isSelected ? colors.N20 : colors.N10;
  } else if (isSelected) {
    bg = isFocused ? 'white' : colors.B.base;
    fg = isFocused ? colors.B.base : 'white';
    border = colors.B.base;
  } else {
    border = isFocused ? colors.N15 : colors.N10;
    bg = isFocused ? colors.N05 : 'white';
    fg = isFocused ? colors.N05 : 'white';
  }

  return (
    <div
      css={{
        alignItems: 'center',
        backgroundColor: bg,
        border: `2px solid ${border}`,
        borderRadius: size,
        boxSizing: 'border-box',
        color: fg,
        display: 'flex',
        height: size,
        justifyContent: 'center',
        width: size,
      }}
    >
      <CheckIcon />
    </div>
  );
};

type OptionPrimitiveProps = {
  children: React.Node,
  isDisabled: boolean,
  isFocused: boolean,
  isSelected: boolean,
  innerRef: ?React.Ref<*>,
  innerProps: Object,
};

export const OptionPrimitive = ({
  children,
  isDisabled,
  innerProps,
  innerRef,
}: OptionPrimitiveProps) => {
  return (
    <div
      ref={innerRef}
      css={{
        alignItems: 'center',
        color: isDisabled ? colors.N40 : null,
        cursor: 'pointer',
        display: 'flex',
        fontSize: '0.9em',
        fontWeight: 500,
        justifyContent: 'space-between',
        outline: 0,
        padding: `${gridSize}px 0`,
        pointerEvents: isDisabled ? 'none' : null,

        '&:not(:first-of-type)': {
          borderTop: `1px solid ${colors.N10}`,
        },
      }}
      {...innerProps}
    >
      {children}
    </div>
  );
};

const optionRendererStyles = {
  control: (provided, state) => ({
    ...provided,
    ...uniformHeight,
    background: state.isFocused ? colors.N10 : colors.N05,
    border: 0,
    boxShadow: 'none',
    cursor: 'text',
    padding: 0,
    minHeight: 34,
  }),
  menu: () => ({ marginTop: 8 }),
  menuList: provided => ({ ...provided, padding: 0 }),
  placeholder: provided => ({ ...provided, color: colors.N50 }),
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
      styles={optionRendererStyles}
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
