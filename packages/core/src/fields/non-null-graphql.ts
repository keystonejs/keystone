import { BaseModelTypeInfo, FieldAccessControl, FieldData } from '../types';

export function hasReadAccessControl<ModelTypeInfo extends BaseModelTypeInfo>(
  access: FieldAccessControl<ModelTypeInfo> | undefined
) {
  if (access === undefined) {
    return false;
  }
  return typeof access === 'function' || typeof access.read === 'function';
}

export function hasCreateAccessControl<ModelTypeInfo extends BaseModelTypeInfo>(
  access: FieldAccessControl<ModelTypeInfo> | undefined
) {
  if (access === undefined) {
    return false;
  }
  return typeof access === 'function' || typeof access.create === 'function';
}

export function getResolvedIsNullable(
  validation: undefined | { isRequired?: boolean },
  db: undefined | { isNullable?: boolean }
): boolean {
  if (db?.isNullable === false) {
    return false;
  }
  if (db?.isNullable === undefined && validation?.isRequired) {
    return false;
  }
  return true;
}

export function assertReadIsNonNullAllowed<ModelTypeInfo extends BaseModelTypeInfo>(
  meta: FieldData,
  config: {
    access?: FieldAccessControl<ModelTypeInfo> | undefined;
    graphql?: { read?: { isNonNull?: boolean } };
  },
  resolvedIsNullable: boolean
) {
  if (config.graphql?.read?.isNonNull) {
    if (resolvedIsNullable) {
      throw new Error(
        `The field at ${meta.modelKey}.${meta.fieldKey} sets graphql.read.isNonNull: true but not validation.isRequired: true or db.isNullable: false.\n` +
          `Set validation.isRequired: true or db.isNullable: false or disable graphql.read.isNonNull`
      );
    }
    if (hasReadAccessControl(config.access)) {
      throw new Error(
        `The field at ${meta.modelKey}.${meta.fieldKey} sets graphql.read.isNonNull: true and has read access control, this is not allowed.\n` +
          'Either disable graphql.read.isNonNull or read access control.'
      );
    }
  }
}

export function assertCreateIsNonNullAllowed<ModelTypeInfo extends BaseModelTypeInfo>(
  meta: FieldData,
  config: {
    access?: FieldAccessControl<ModelTypeInfo> | undefined;
    graphql?: { create?: { isNonNull?: boolean } };
  }
) {
  if (config.graphql?.create?.isNonNull && hasCreateAccessControl(config.access)) {
    throw new Error(
      `The field at ${meta.modelKey}.${meta.fieldKey} sets graphql.create.isNonNull: true and has create access control, this is not allowed.\n` +
        'Either disable graphql.create.isNonNull or create access control.'
    );
  }
}
