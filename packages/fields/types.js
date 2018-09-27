type Field = any;

import * as React from 'react';

export type FilterProps = {
  innerRef: React.Ref<HTMLElement>,
  recalcHeight: () => mixed,
  value: string,
  onChange: string => mixed,
  field: Field,
};

export type CellProps = {};

export type FieldProps = {};
