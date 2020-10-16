/** @jsx jsx */
import { jsx } from '@keystone-ui/core';
import ReactSelect, { Props } from 'react-select';
import { widthMap } from './hooks/inputs';
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

export function Select({
  onChange,
  value,
  width: widthKey = 'large',
  ...props
}: BaseSelectProps & {
  value: Option | null;
  onChange(value: Option | null): void;
}) {
  const width = widthMap[widthKey];

  return (
    <ReactSelect
      value={value}
      css={{ zIndex: 3, width }}
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
  const width = widthMap[widthKey];

  return (
    <ReactSelect
      css={{ zIndex: 3, width }}
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
