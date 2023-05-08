import type { MaybePromise } from './types/utils';
import type { BaseListTypeInfo } from './types';
import type { AccessOperation, BaseAccessArgs } from './types/config/access-control';

export function allowAll() {
  return true;
}

export function denyAll() {
  return false;
}

export function unfiltered<ListTypeInfo extends BaseListTypeInfo>(): MaybePromise<boolean | ListTypeInfo['inputs']['where']> {
  return true;
}

export function allOperations<ListTypeInfo extends BaseListTypeInfo>(
  func: (args: BaseAccessArgs<ListTypeInfo> & { operation: AccessOperation }) => boolean
) {
  return {
    query: func,
    create: func,
    update: func,
    delete: func,
  };
}
