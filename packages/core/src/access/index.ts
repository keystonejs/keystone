import { BaseListTypeInfo } from '../types';
import { BaseAccessArgs } from '../types/config/access-control';

export function allowAll() {
  return true;
}
export function denyAll() {
  return false;
}

export function allOperations<ListTypeInfo extends BaseListTypeInfo>(
  func: (args: BaseAccessArgs<ListTypeInfo>) => boolean
) {
  return {
    query: func,
    create: func,
    update: func,
    delete: func,
  };
}
