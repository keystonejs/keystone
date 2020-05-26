import { Relationship } from '@keystonejs/fields';

export class AuthedRelationship extends Relationship.implementation {
  constructor(path, config, meta) {
    let access;
    if (typeof config.access === 'object') {
      access = config.access;
    } else if (typeof config.access !== 'undefined') {
      access = {
        create: config.access,
        read: config.access,
        update: config.access,
      };
    }

    access = {
      // Set default access control values
      // These are stricter than Keystone's defaults
      ...{ create: false, read: true, update: false },
      ...access,
    };

    super(
      path,
      {
        ...config,
        access,
      },
      meta
    );

    if (typeof this.defaultValue !== 'undefined') {
      throw new Error(
        `An AuthedRelationship field's default is derived from the currently authenticated item. Try removing 'defaultValue: ...' from ${this.listKey}.${this.path}`
      );
    }

    if (this.many) {
      throw new Error(
        `An AuthedRelationship field can only be to-single, not to-many. Try removing 'many: true' from ${this.listKey}.${this.path}`
      );
    }

    // Reset this so there are no core-level isRequired checks run. We'll handle
    // them ourselves with this.isRequiredOnCreate
    this.isRequiredOnCreate = this.isRequired;
    this.isRequired = false;

    this.defaultValue = ({ context }) => {
      if (this.isRequiredOnCreate) {
        if (!context.authedListKey) {
          throw new Error(
            `An unauthenticated request attempted to create a new ${this.listKey} without specifying a value for ${this.listKey}.${this.path}<AuthenticatedRelationship>, however it is marked 'isRequired'.`
          );
        }

        if (context.authedListKey !== this.refListKey) {
          throw new Error(
            `${this.listKey}.${this.path}<AuthedRelationship> is marked as 'isRequired'`
          );
          throw new Error(
            `A request attempted to create a new ${this.listKey} without specifying a value for ${this.listKey}.${this.path}<AuthenticatedRelationship>. This request was authenticated with the list ${this.listKey}, however ${this.listKey}.${this.path} is configured to reference the list ${this.refListKey}.`
          );
        }
      }

      if (context.authedListKey === this.refListKey && context.authedItem) {
        return { connect: { id: context.authedItem.id } };
      }

      return undefined;
    };
  }
}
