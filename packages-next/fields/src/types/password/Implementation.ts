import { PrismaFieldAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
// @ts-ignore
import dumbPasswords from 'dumb-passwords';
import { FieldConfigArgs, FieldExtraArgs, Implementation } from '../../Implementation';

type List = { adapter: PrismaListAdapter };

const bcryptHashRegex = /^\$2[aby]?\$\d{1,2}\$[.\/A-Za-z0-9]{53}$/;

export class Password<P extends string> extends Implementation<P> {
  bcrypt: Pick<typeof import('bcryptjs'), 'compare' | 'compareSync' | 'hash' | 'hashSync'>;
  rejectCommon: boolean;
  minLength: number;
  workFactor: number;

  constructor(
    path: P,
    {
      rejectCommon,
      minLength = 8,
      workFactor = 10,
      useCompiledBcrypt,
      bcrypt,
      ...configArgs
    }: FieldConfigArgs & {
      rejectCommon?: boolean;
      minLength?: number;
      workFactor?: number;
      useCompiledBcrypt?: boolean;
      bcrypt?: Pick<typeof import('bcryptjs'), 'compare' | 'compareSync' | 'hash' | 'hashSync'>;
    },
    extraArgs: FieldExtraArgs
  ) {
    super(
      path,
      { rejectCommon, minLength, workFactor, useCompiledBcrypt, bcrypt, ...configArgs },
      extraArgs
    );
    if (useCompiledBcrypt) {
      throw new Error(
        `The Password field at ${this.listKey}.${path} specifies the option "useCompiledBcrypt", this has been replaced with a "bcrypt" option which accepts a different implementation of bcrypt(such as the native npm package, "bcrypt")`
      );
    }
    this.bcrypt = bcrypt || require('bcryptjs');

    // Sanitise field specific config
    this.rejectCommon = !!rejectCommon;
    this.minLength = Math.max(minLength, 1);
    // Min 4, max: 31, default: 10
    this.workFactor = Math.min(Math.max(workFactor, 4), 31);

    if (this.workFactor < 6) {
      console.warn(
        `The workFactor for ${this.listKey}.${this.path} is very low! ` +
          `This will cause weak hashes!`
      );
    }
  }

  get _supportsUnique() {
    return false;
  }

  gqlOutputFields() {
    return [`${this.path}_is_set: Boolean`];
  }
  gqlOutputFieldResolvers() {
    return {
      [`${this.path}_is_set`]: (item: Record<P, any>) => {
        const val = item[this.path];
        return bcryptHashRegex.test(val);
      },
    };
  }

  gqlQueryInputFields() {
    return [`${this.path}_is_set: Boolean`];
  }
  gqlUpdateInputFields() {
    return [`${this.path}: String`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: String`];
  }

  // Wrap bcrypt functionality
  // The compare() and compareSync() functions are constant-time
  // The compare() and generateHash() functions will return a Promise if no call back is provided
  compare(candidate: string, hash: string) {
    return this.bcrypt.compare(candidate, hash);
  }
  compareSync(candidate: string, hash: string) {
    return this.bcrypt.compareSync(candidate, hash);
  }
  generateHash(plaintext: string) {
    this.validateNewPassword(plaintext);
    return this.bcrypt.hash(plaintext, this.workFactor);
  }
  generateHashSync(plaintext: string) {
    this.validateNewPassword(plaintext);
    return this.bcrypt.hashSync(plaintext, this.workFactor);
  }

  // Force values to be hashed when set
  validateNewPassword(password: string) {
    if (this.rejectCommon && dumbPasswords.check(password)) {
      throw new Error(
        `[password:rejectCommon:${this.listKey}:${this.path}] Common and frequently-used passwords are not allowed.`
      );
    }
    // TODO: checking string length is not simple; might need to revisit this (see https://mathiasbynens.be/notes/javascript-unicode)
    if (String(password).length < this.minLength) {
      throw new Error(
        `[password:minLength:${this.listKey}:${this.path}] Value must be at least ${this.minLength} characters long.`
      );
    }
  }

  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'string | null' } };
  }
}

export class PrismaPasswordInterface<P extends string> extends PrismaFieldAdapter<P> {
  field: Password<P>;
  constructor(
    fieldName: string,
    path: P,
    field: Password<P>,
    listAdapter: PrismaListAdapter,
    getListByKey: (arg: string) => List | undefined,
    config = {}
  ) {
    super(fieldName, path, field, listAdapter, getListByKey, config);
    this.field = field;

    // Error rather than ignoring invalid config
    if (this.config.isUnique || this.config.isIndexed) {
      throw (
        `The Password field type doesn't support indexes on Prisma. ` +
        `Check the config for ${this.path} on the ${this.field.listKey} list`
      );
    }
  }

  getPrismaSchema() {
    return [this._schemaField({ type: 'String' })];
  }

  getQueryConditions<T>(dbPath: string) {
    // JM: I wonder if performing a regex match here leaks any timing info that
    // could be used to extract information about the hash.. :/
    return {
      // FIXME: Prisma needs to support regex matching...
      [`${this.path}_is_set`]: (value: T | null) =>
        value ? { NOT: { [dbPath]: null } } : { [dbPath]: null },
      // ? b.where(dbPath, '~', bcryptHashRegex.source)
      // : b.where(dbPath, '!~', bcryptHashRegex.source).orWhereNull(dbPath),
    };
  }

  setupHooks({ addPreSaveHook }: { addPreSaveHook: (hook: any) => void }) {
    // Updates the relevant value in the item provided (by referrence)
    addPreSaveHook(async (item: Record<P, any>) => {
      const path = this.field.path;
      const plaintext = item[path];

      // Only run the hook if the item actually contains the field
      // NOTE: Can't use hasOwnProperty here, as the mongoose data object
      // returned isn't a POJO
      if (!(path in item)) {
        return item;
      }

      if (plaintext) {
        if (typeof plaintext === 'string') {
          item[path] = await this.field.generateHash(plaintext);
        } else {
          // Should have been caught by the validator??
          throw `Invalid Password value given for '${path}'`;
        }
      } else {
        item[path] = null;
      }

      return item;
    });
  }
}
