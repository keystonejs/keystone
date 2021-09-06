import { BaseGeneratedListTypes, FieldAccessControl, FieldData } from '../types';

export function hasReadAccessControl(
  access: FieldAccessControl<BaseGeneratedListTypes> | undefined
) {
  if (typeof access === 'boolean') {
    return !access;
  }
  if (
    access === undefined ||
    typeof access === 'function' ||
    typeof access.read === 'function' ||
    access.read === false
  ) {
    return false;
  }
  return true;
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
