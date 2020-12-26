import { BaseGeneratedListTypes, FieldConfig, ListHooks } from '@keystone-next/types';

export type ListTrackingOptions = {
  created?: boolean;
  updated?: boolean;
} & FieldConfig<BaseGeneratedListTypes>;

export type AtTrackingOptions = {
  createdAtField?: string;
  updatedAtField?: string;
} & ListTrackingOptions;

export type ByTrackingOptions = {
  createdByField?: string;
  updatedByField?: string;
  ref?: string;
} & ListTrackingOptions;

export type ResolveInputHook = ListHooks<BaseGeneratedListTypes>['resolveInput'];

