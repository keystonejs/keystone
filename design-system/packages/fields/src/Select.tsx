/** @jsx jsx */
import { jsx, useTheme } from '@keystone-ui/core';
import ReactSelect, { Props } from 'react-select';
import { useInputTokens } from './hooks/inputs';
import { WidthType } from './types';

type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K;
} extends { [_ in keyof T]: infer U }
  ? U
  : never;

type Option = { label: string; value: string; isDisabled?: boolean };

// this removes [key: string]: any from Props
type BaseSelectProps = Pick<
  Props<Option>,
  Exclude<KnownKeys<Props>, 'value' | 'onChange' | 'isMulti' | 'isOptionDisabled'>
> & { width?: WidthType };

export { components as selectComponents } from 'react-select';

type ControlState = {
  isDisabled: boolean;
  isFocused: boolean;
};

const useStyles = ({
  tokens,
  multi = false,
}: {
  tokens: ReturnType<typeof useInputTokens>;
  multi?: boolean;
}) => {
  const { palette } = useTheme();
  const indicatorStyles = (provided: any, state: ControlState) => ({
    ...provided,
    color: state.isFocused ? palette.neutral600 : palette.neutral500,
    ':hover': {
      color: state.isFocused ? palette.neutral800 : palette.neutral700,
    },
  });
  return {
    control: (provided: any, state: ControlState) => {
      const base = {
        ...provided,
        backgroundColor: tokens.background,
        borderColor: tokens.borderColor,
        borderRadius: tokens.borderRadius,
        borderWidth: tokens.borderWidth,
        fontSize: tokens.fontSize,
        boxShadow: tokens.shadow,
        transition: tokens.transition,
      };
      const variant = state.isDisabled
        ? {
            backgroundColor: tokens.disabled.background || tokens.background,
            borderColor: tokens.disabled.borderColor || tokens.borderColor,
            boxShadow: tokens.disabled.shadow || tokens.shadow,
            color: tokens.disabled.foreground || tokens.foreground,
          }
        : state.isFocused
        ? {
            backgroundColor: tokens.focus.background || tokens.background,
            borderColor: tokens.focus.borderColor || tokens.borderColor,
            boxShadow: tokens.focus.shadow || tokens.shadow,
            color: tokens.focus.foreground || tokens.foreground,
          }
        : {
            ':hover': {
              backgroundColor: tokens.hover.background,
              borderColor: tokens.hover.borderColor,
              boxShadow: tokens.hover.shadow,
              color: tokens.hover.foreground,
            },
          };
      return { ...provided, ...base, ...variant };
    },
    clearIndicator: indicatorStyles,
    dropdownIndicator: indicatorStyles,
    menu: (provided: any) => ({
      ...provided,
      border: `1px solid ${palette.neutral400}`,
      boxShadow: '0 4px 11px hsla(0, 0%, 0%, 0.1)',
      borderRadius: tokens.borderRadius,
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: palette.neutral300,
      borderRadius: tokens.borderRadius,
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      // fontSize: typography.fontSize.medium,
      fontSize: '90%',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      borderRadius: tokens.borderRadius,
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: tokens.placeholder,
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: multi ? `0 4px` : `0 6px`,
    }),
  };
};

export function Select({
  onChange,
  value,
  width: widthKey = 'large',
  ...props
}: BaseSelectProps & {
  value: Option | null;
  onChange(value: Option | null): void;
}) {
  const tokens = useInputTokens({ width: widthKey });
  const styles = useStyles({ tokens });

  return (
    <ReactSelect
      value={value}
      css={{ width: tokens.width }}
      styles={styles}
      onChange={value => {
        if (!value) {
          onChange(null);
        } else {
          onChange(value as any);
        }
      }}
      {...props}
      isMulti={false}
    />
  );
}

export function MultiSelect({
  onChange,
  value,
  width: widthKey = 'large',
  ...props
}: BaseSelectProps & {
  value: Option[];
  onChange(value: Option[]): void;
}) {
  const tokens = useInputTokens({ width: widthKey });
  const styles = useStyles({ tokens, multi: true });

  return (
    <ReactSelect
      css={{ width: tokens.width }}
      styles={styles}
      value={value}
      onChange={value => {
        if (!value) {
          onChange([]);
        } else if (Array.isArray(value)) {
          onChange(value);
        } else {
          onChange([value as any]);
        }
      }}
      {...props}
      isMulti
    />
  );
}
