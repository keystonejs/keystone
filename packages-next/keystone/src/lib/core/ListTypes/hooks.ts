import { omitBy, arrayToObject } from '@keystone-next/utils-legacy';
import { Implementation } from '@keystone-next/fields';
import { KeystoneContext, ListHooks } from '@keystone-next/types';
import { mapToFields } from './utils';
import { ValidationFailureError } from './graphqlErrors';

type ValidationError = { msg: string; data: {}; internalData: {} };

export class HookManager {
  fields: Implementation<any>[];
  hooks: ListHooks<any>;
  listKey: string;
  fieldsByPath: Record<string, Implementation<any>>;
  constructor({
    fields,
    hooks,
    listKey,
  }: {
    fields: Implementation<any>[];
    hooks: ListHooks<any>;
    listKey: string;
  }) {
    this.fields = fields;
    this.hooks = hooks;
    this.listKey = listKey;
    this.fieldsByPath = arrayToObject(this.fields, 'path');
  }

  _fieldsFromObject(obj: Record<string, any>) {
    return Object.keys(obj)
      .map(fieldPath => this.fieldsByPath[fieldPath])
      .filter(field => field);
  }

  _throwValidationFailure({
    errors,
    operation,
    originalInput,
  }: {
    errors: ValidationError[];
    operation: 'create' | 'update' | 'delete';
    originalInput: Record<string, any>;
  }) {
    throw new ValidationFailureError({
      data: {
        messages: errors.map(e => e.msg),
        errors: errors.map(e => e.data),
        listKey: this.listKey,
        operation,
      },
      internalData: { errors: errors.map(e => e.internalData), data: originalInput },
    });
  }

  async resolveInput({
    resolvedData,
    existingItem,
    context,
    operation,
    originalInput,
  }: {
    resolvedData: Record<string, any>;
    existingItem?: Record<string, any>;
    context: KeystoneContext;
    operation: 'create' | 'update';
    originalInput: Record<string, any>;
  }) {
    const { listKey } = this;
    const args = { resolvedData, existingItem, context, originalInput, operation, listKey };

    // First we run the field type hooks
    // NOTE: resolveInput is run on _every_ field, regardless if it has a value
    // passed in or not
    resolvedData = await mapToFields(this.fields, (field: Implementation<any>) =>
      field.resolveInput(args)
    );

    // We then filter out the `undefined` results (they should return `null` or
    // a value)
    resolvedData = omitBy(resolvedData, key => typeof resolvedData[key] === 'undefined');

    // Run the schema-level field hooks, passing in the results from the field
    // type hooks
    resolvedData = {
      ...resolvedData,
      ...(await mapToFields(
        this.fields.filter(field => field.hooks.resolveInput),
        (field: Implementation<any>) =>
          field.hooks.resolveInput({ ...args, fieldPath: field.path, resolvedData })
      )),
    };

    // And filter out the `undefined`s again.
    resolvedData = omitBy(resolvedData, key => typeof resolvedData[key] === 'undefined');

    if (this.hooks.resolveInput) {
      // And run any list-level hook
      resolvedData = await this.hooks.resolveInput({ ...args, resolvedData });
      if (typeof resolvedData !== 'object') {
        throw new Error(
          `Expected ${
            this.listKey
          }.hooks.resolveInput() to return an object, but got a ${typeof resolvedData}: ${resolvedData}`
        );
      }
    }

    // Finally returning the amalgamated result of all the hooks.
    return resolvedData;
  }

  async validateInput({
    resolvedData,
    existingItem,
    context,
    operation,
    originalInput,
  }: {
    resolvedData: Record<string, any>;
    existingItem?: Record<string, any>;
    context: KeystoneContext;
    operation: 'create' | 'update';
    originalInput: Record<string, any>;
  }) {
    const { listKey } = this;
    const args = { resolvedData, existingItem, context, originalInput, operation, listKey };
    // Check for isRequired
    const fieldValidationErrors = this.fields
      .filter(
        field =>
          field.isRequired &&
          !field.isRelationship &&
          ((operation === 'create' &&
            (resolvedData[field.path] === undefined || resolvedData[field.path] === null)) ||
            (operation === 'update' &&
              Object.prototype.hasOwnProperty.call(resolvedData, field.path) &&
              (resolvedData[field.path] === undefined || resolvedData[field.path] === null)))
      )
      .map(f => ({
        msg: `Required field "${f.path}" is null or undefined.`,
        data: { resolvedData, operation, originalInput },
        internalData: {},
      }));
    if (fieldValidationErrors.length) {
      this._throwValidationFailure({ errors: fieldValidationErrors, operation, originalInput });
    }

    const fields = this._fieldsFromObject(resolvedData);
    await this._validateHook({ args, fields, operation, hookName: 'validateInput' });
  }

  async validateDelete({
    existingItem,
    context,
    operation,
  }: {
    existingItem?: Record<string, any>;
    context: KeystoneContext;
    operation: 'delete';
  }) {
    const { listKey } = this;
    const args = { existingItem, context, operation, listKey };
    const fields = this.fields;
    await this._validateHook({ args, fields, operation, hookName: 'validateDelete' });
  }

  async _validateHook({
    args,
    fields,
    operation,
    hookName,
  }: {
    args: any;
    fields: Implementation<any>[];
    operation: 'create' | 'update' | 'delete';
    hookName: 'validateInput' | 'validateDelete';
  }) {
    const { originalInput } = args;
    const fieldValidationErrors: ValidationError[] = [];
    // FIXME: Can we do this in a way where we simply return validation errors instead?
    const addFieldValidationError = (msg: string, _data = {}, internalData = {}) =>
      fieldValidationErrors.push({ msg, data: _data, internalData });
    const fieldArgs = { addFieldValidationError, ...args };
    await mapToFields(fields, (field: Implementation<any>) =>
      field[hookName]({ fieldPath: field.path, ...fieldArgs })
    );
    await mapToFields(
      fields.filter(field => field.hooks[hookName]),
      (field: Implementation<any>) => field.hooks[hookName]({ fieldPath: field.path, ...fieldArgs })
    );
    if (fieldValidationErrors.length) {
      this._throwValidationFailure({ errors: fieldValidationErrors, operation, originalInput });
    }

    if (this.hooks[hookName]) {
      const listValidationErrors: ValidationError[] = [];
      await this.hooks[hookName]!({
        ...args,
        addValidationError: (msg: string, _data = {}, internalData = {}) =>
          listValidationErrors.push({ msg, data: _data, internalData }),
      });
      if (listValidationErrors.length) {
        this._throwValidationFailure({ errors: listValidationErrors, operation, originalInput });
      }
    }
  }

  async beforeChange({
    resolvedData,
    existingItem,
    context,
    operation,
    originalInput,
  }: {
    resolvedData: Record<string, any>;
    existingItem?: Record<string, any>;
    context: KeystoneContext;
    operation: 'create' | 'update';
    originalInput: Record<string, any>;
  }) {
    const { listKey } = this;
    const args = { resolvedData, existingItem, context, originalInput, operation, listKey };
    await this._runHook({ args, fieldObject: resolvedData, hookName: 'beforeChange' });
  }

  async beforeDelete({
    existingItem,
    context,
    operation,
  }: {
    existingItem: Record<string, any>;
    context: KeystoneContext;
    operation: 'delete';
  }) {
    const { listKey } = this;
    const args = { existingItem, context, operation, listKey };
    await this._runHook({ args, fieldObject: existingItem, hookName: 'beforeDelete' });
  }

  async afterChange({
    updatedItem,
    existingItem,
    context,
    operation,
    originalInput,
  }: {
    updatedItem: Record<string, any>;
    existingItem?: Record<string, any>;
    context: KeystoneContext;
    operation: 'create' | 'update';
    originalInput: Record<string, any>;
  }) {
    const { listKey } = this;
    const args = { updatedItem, originalInput, existingItem, context, operation, listKey };
    await this._runHook({ args, fieldObject: updatedItem, hookName: 'afterChange' });
  }

  async afterDelete({
    existingItem,
    context,
    operation,
  }: {
    existingItem: Record<string, any>;
    context: KeystoneContext;
    operation: 'delete';
  }) {
    const { listKey } = this;
    const args = { existingItem, context, operation, listKey };
    await this._runHook({ args, fieldObject: existingItem, hookName: 'afterDelete' });
  }

  async _runHook({
    args,
    fieldObject,
    hookName,
  }: {
    args: any;
    fieldObject: Record<string, any>;
    hookName: keyof ListHooks<any>;
  }) {
    // Used to apply hooks that only produce side effects
    const fields = this._fieldsFromObject(fieldObject);
    await mapToFields(fields, (field: Implementation<any>) => field[hookName](args));
    await mapToFields(
      fields.filter(field => field.hooks[hookName]),
      (field: Implementation<any>) => field.hooks[hookName]({ fieldPath: field.path, ...args })
    );

    if (this.hooks[hookName]) await this.hooks[hookName]!(args);
  }
}
