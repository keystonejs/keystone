// @flow
type Field = any;

type List = any;

import * as React from 'react';

type Filter = { type: string, label: string };

export type FilterProps<Value> = {
  innerRef: React.Ref<*>,
  value: Value,
  onChange: Value => mixed,
  field: Field,
  filter: Filter,
};

export type CellProps<Value> = {
  list: List,
  field: Field,
  data: Value,
  Link: React.ComponentType<{ children: React.Node, id: string, path: string }>,
};

export type FieldProps = any;
