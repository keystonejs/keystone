import { BaseGeneratedListTypes, FieldAccessControl, FieldData } from '../types';

export function hasReadAccessControl(
  access: FieldAccessControl<BaseGeneratedListTypes> | undefined
) {
  if (access === undefined) {
    return false;
  }
  return typeof access === 'function' || typeof access.read === 'function';
}

export function hasCreateAccessControl(
  access: FieldAccessControl<BaseGeneratedListTypes> | undefined
) {
  if (access === undefined) {
    return false;
  }
  return typeof access === 'function' || typeof access.create === 'function';
}

export function getResolvedIsNullable(config: {
  validation?: { isRequired?: boolean };
  db?: { isNullable?: boolean };
}): boolean {
  if (config.db?.isNullable === false) {
    return false;
  }
  if (config.db?.isNullable === undefined && config.validation?.isRequired) {
    return false;
  }
  return true;
}

export function assertReadIsNonNullAllowed(
  meta: FieldData,
  config: {
    access?: FieldAccessControl<BaseGeneratedListTypes> | undefined;
    graphql?: { read?: { isNonNull?: boolean } };
  },
  resolvedIsNullable: boolean
) {
  if (config.graphql?.read?.isNonNull) {
    if (resolvedIsNullable) {
      throw new Error(
        `The field at ${meta.listKey}.${meta.fieldKey} sets graphql.read.isNonNull: true and but not validation.isRequired: true or db.isNullable: false.\n` +
          `Set validation.isRequired: true or db.isNullable: false or disable graphql.read.isNonNull`
      );
    }
    if (hasReadAccessControl(config.access)) {
      throw new Error(
        `The field at ${meta.listKey}.${meta.fieldKey} sets graphql.read.isNonNull: true and has read access control, this is not allowed.\n` +
          'Either disable graphql.read.isNonNull or read access control.'
      );
    }
  }
}

export function assertCreateIsNonNullAllowed(
  meta: FieldData,
  config: {
    access?: FieldAccessControl<BaseGeneratedListTypes> | undefined;
    graphql?: { create?: { isNonNull?: boolean } };
  }
) {
  if (config.graphql?.create?.isNonNull && hasCreateAccessControl(config.access)) {
    throw new Error(
      `The field at ${meta.listKey}.${meta.fieldKey} sets graphql.create.isNonNull: true and has create access control, this is not allowed.\n` +
        'Either disable graphql.create.isNonNull or create access control.'
    );
  }
}
