/** @jsx jsx */
import { jsx, useTheme } from '@keystone-ui/core';
import { CheckIcon } from '@keystone-ui/icons/icons/CheckIcon';
import { ComponentProps, useMemo } from 'react';
import ReactSelect, { components as reactSelectComponents, Props } from 'react-select';

export const CheckMark = ({
  isDisabled,
  isFocused,
  isSelected,
}: {
  isDisabled?: boolean;
  isFocused?: boolean;
  isSelected?: boolean;
}) => {
  let bg;
  let fg;
  let border;
  let size = 24;

  const theme = useTheme();

  if (isDisabled) {
    bg = theme.fields.disabled.controlForeground;
    fg = isSelected ? 'white' : theme.fields.disabled.controlForeground;
    border = theme.fields.disabled.controlForeground;
  } else if (isSelected) {
    bg = isFocused ? 'white' : theme.fields.selected.controlBorderColor;
    fg = isFocused ? theme.fields.selected.controlBorderColor : 'white';
    border = theme.fields.selected.controlBorderColor;
  } else {
    border = isFocused ? theme.fields.focus.controlBorderColor : theme.fields.controlBorderColor;
    bg = 'white';
    fg = 'white';
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
      <CheckIcon size="small" />
    </div>
  );
};

export const OptionPrimitive = ({
  children,
  isDisabled,
  innerProps,
  innerRef,
  className,
}: ComponentProps<typeof reactSelectComponents['Option']>) => {
  const theme = useTheme();
  return (
    <div
      ref={innerRef}
      className={className}
      css={{
        alignItems: 'center',
        color: isDisabled ? theme.colors.foregroundDim : undefined,
        cursor: 'pointer',
        display: 'flex',
        fontSize: '0.9em',
        fontWeight: 500,
        justifyContent: 'space-between',
        outline: 0,
        padding: `${theme.spacing.small}px 0`,
        pointerEvents: isDisabled ? 'none' : undefined,

        '&:not(:first-of-type)': {
          borderTop: `1px solid ${theme.colors.backgroundDim}`,
        },
      }}
      {...innerProps}
    >
      {children}
    </div>
  );
};

const Control: typeof reactSelectComponents['Control'] = ({ selectProps, ...props }) => {
  return selectProps.shouldDisplaySearchControl ? (
    <reactSelectComponents.Control selectProps={selectProps} {...props} />
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
      <reactSelectComponents.Control selectProps={selectProps} {...props} />
    </div>
  );
};

const defaultComponents = {
  Control,
  Option: OptionPrimitive,
  DropdownIndicator: null,
  IndicatorSeparator: null,
};

type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K;
} extends { [_ in keyof T]: infer U }
  ? U
  : never;

// this removes [key: string]: any from Props
type OptionsProps = Pick<
  Props<{ label: string; value: string; isDisabled?: boolean }>,
  KnownKeys<Props>
>;

export const Options = ({ components: propComponents, ...props }: OptionsProps) => {
  const components = useMemo(
    () => ({
      ...defaultComponents,
      ...propComponents,
    }),
    [propComponents]
  );
  const displaySearch = true;
  const theme = useTheme();

  const optionRendererStyles: Props['styles'] = useMemo(
    () => ({
      control: provided => ({
        ...provided,
        background: theme.fields.inputBackground,
        boxShadow: 'none',
        cursor: 'text',
        padding: 0,
        minHeight: 34,
      }),
      menu: () => ({
        marginTop: 8,
      }),
      menuList: provided => ({
        ...provided,
        padding: 0,
      }),
      placeholder: provided => ({
        ...provided,
        color: theme.fields.inputPlaceholder,
      }),
    }),
    [theme]
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
      shouldDisplaySearchControl={displaySearch}
      styles={optionRendererStyles}
      // TODO: JW: Not a fan of this, but it doesn't seem to make a difference
      // if we take it out. react-select bug maybe?
      tabSelectsValue={false}
      components={components as any}
      {...props}
    />
  );
};
