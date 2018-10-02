// @flow
// this is what flow will see as the FIELD_TYPES file

import type { ComponentType } from 'react';

type FilterProps = {};

type CellProps = {};

type FieldProps = {};

type FieldTypes = {
  [list: string]: {
    [field: string]: {
      Controller: FieldControllerType,
      Filter?: ComponentType<FilterProps>,
      Cell?: ComponentType<CellProps>,
      Field?: ComponentType<FieldProps>,
    },
  },
};

declare var fieldTypes: FieldTypes;

export default fieldTypes;
