import type { BaseGeneratedListTypes } from '../utils';
import { NextFieldType } from '../next-fields';

export type BaseFields<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  [key: string]: NextFieldType;
};
