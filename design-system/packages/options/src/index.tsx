/** @jsx jsx */
import { jsx, useTheme } from '@keystone-ui/core';
import { useIndicatorTokens } from '@keystone-ui/fields';
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
  const tokens = useIndicatorTokens({
    size: 'medium',
    type: 'radio',
  });

  return (
    <div
      className={`${isDisabled ? 'disabled ' : ''}${isFocused ? 'focus ' : ''}${
        isSelected ? 'selected' : ''
      }`}
      css={{
        alignItems: 'center',
        backgroundColor: tokens.background,
        borderColor: tokens.borderColor,
        borderRadius: tokens.borderRadius,
        borderStyle: 'solid',
        borderWidth: tokens.borderWidth,
        boxSizing: 'border-box',
        color: tokens.foreground,
        cursor: 'pointer',
        display: 'flex',
        flexShrink: 0,
        height: tokens.boxSize,
        justifyContent: 'center',
        transition: tokens.transition,
        width: tokens.boxSize,

        '&.focus': {
          backgroundColor: tokens.focus.background,
          borderColor: tokens.focus.borderColor,
          boxShadow: tokens.focus.shadow,
          color: tokens.focus.foreground,
        },
        '&.selected': {
          backgroundColor: tokens.selected.background,
          borderColor: tokens.selected.borderColor,
          boxShadow: tokens.selected.shadow,
          color: tokens.selected.foreground,
        },
        '&.disabled': {
          backgroundColor: tokens.disabled.background,
          borderColor: tokens.disabled.borderColor,
          boxShadow: tokens.disabled.shadow,
          color: tokens.disabled.background,
          cursor: 'default',
        },
        '&.selected.disabled': {
          color: tokens.disabled.foreground,
        },
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
  Props<{ label: string; value: string; isDisabled?: boolean }, boolean>,
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
