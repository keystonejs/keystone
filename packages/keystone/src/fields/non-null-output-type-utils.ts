import { BaseGeneratedListTypes, FieldAccessControl, FieldData } from '../types';

export function hasReadAccessControl(
  access: FieldAccessControl<BaseGeneratedListTypes> | undefined
) {
  if (access === undefined) {
    return false;
  }
  if (typeof access === 'function' || typeof access.read === 'function') {
    return true;
  }
  return false;
}

export function assertIsNonNullAllowed(
  meta: FieldData,
  access: FieldAccessControl<BaseGeneratedListTypes> | undefined,
  isNonNull: boolean | undefined
) {
  if (isNonNull && hasReadAccessControl(access)) {
    throw new Error(
      `The field at ${meta.listKey}.${meta.fieldKey} sets graphql.isNonNull: true and has read access control, this is not allowed.\n` +
        'Either disable graphql.isNonNull or read access control.'
    );
  }
}
