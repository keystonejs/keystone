// @flow
type Field = any;

import * as React from 'react';

export type FilterProps = {
  innerRef: React.Ref<*>,
  recalcHeight: () => mixed,
  value: mixed,
  onChange: mixed => mixed,
  field: Field,
  filter: *,
};

export type CellProps = {};

export type FieldProps = {};
