// @flow
type Field = any;

import * as React from 'react';

export type FilterProps<Value> = {
  innerRef: React.Ref<*>,
  recalcHeight: () => mixed,
  value: Value,
  onChange: Value => mixed,
  field: Field,
  filter: *,
};

export type CellProps = {};

export type FieldProps = {};
