// @flow
type Field = any;

type List = any;

import * as React from 'react';

export type FilterProps<Value> = {
  innerRef: React.Ref<*>,
  recalcHeight: () => mixed,
  value: Value,
  onChange: Value => mixed,
  field: Field,
  filter: *,
};

export type CellProps<Value> = {
  list: List,
  field: Field,
  data: Value,
  Link: React.ComponentType<{ children: React.Node, id: string, path: string }>,
};

export type FieldProps = any;
