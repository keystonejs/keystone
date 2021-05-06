// @ts-ignore
import inflection from 'inflection';
import { humanize } from '@keystone-next/utils-legacy';
import { PrismaFieldAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
import { BaseKeystoneList } from '@keystone-next/types';
import { FieldConfigArgs, FieldExtraArgs, Implementation } from '../../Implementation';

type DataType = 'string' | 'integer' | 'enum';

function initOptions(options: string | any[]) {
  let optionsArray = options;
  if (typeof options === 'string') optionsArray = options.split(/\,\s*/);
  if (!Array.isArray(optionsArray)) return null;
  return optionsArray.map(i => {
    return typeof i === 'string' ? { value: i, label: humanize(i) } : i;
  });
}

const VALID_DATA_TYPES = ['enum', 'string', 'integer'];
const DOCS_URL = 'https://next.keystonejs.com/apis/fields#select';

function validateOptions({
  options,
  dataType,
  listKey,
  path,
}: {
  options: any;
  dataType: DataType;
  listKey: string;
  path: string;
}) {
  if (!VALID_DATA_TYPES.includes(dataType)) {
    throw new Error(
      `
🚫 The select field ${listKey}.${path} is not configured with a valid data type;
📖 see ${DOCS_URL}
`
    );
  }
  options.forEach((option: { value: string }, i: number) => {
    if (dataType === 'enum') {
      if (!/^[a-zA-Z]\w*$/.test(option.value)) {
        throw new Error(
          `
🚫 The select field ${listKey}.${path} contains an invalid enum value ("${option.value}") in option ${i}
👉 You may want to use the "string" dataType
📖 see ${DOCS_URL}
`
        );
      }
    } else if (dataType === 'string') {
      if (typeof option.value !== 'string') {
        const integerHint =
          typeof option.value === 'number'
            ? `
👉 Did you mean to use the the "integer" dataType?`
            : '';
        throw new Error(
          `
🚫 The select field ${listKey}.${path} contains an invalid value (type ${typeof option.value}) in option ${i}${integerHint}
📖 see ${DOCS_URL}
`
        );
      }
    } else if (dataType === 'integer') {
      if (!Number.isInteger(option.value)) {
        throw new Error(
          `
🚫 The select field ${listKey}.${path} contains an invalid integer value ("${option.value}") in option ${i}
📖 see ${DOCS_URL}
`
        );
      }
    }
  });
}

export class Select<P extends string> extends Implementation<P> {
  options: any;
  dataType: DataType;
  constructor(
    path: P,
    {
      options,
      dataType = 'string',
      ...configArgs
    }: FieldConfigArgs & { options: any; dataType?: DataType },
    extraArgs: FieldExtraArgs
  ) {
    super(path, { options, dataType, ...configArgs }, extraArgs);
    this.options = initOptions(options);
    validateOptions({ options: this.options, dataType, listKey: this.listKey, path });
    this.dataType = dataType;
    this.isOrderable = true;
  }

  get _supportsUnique() {
    return true;
  }

  gqlOutputFields() {
    return [`${this.path}: ${this.getTypeName()}`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: (item: Record<P, any>) => item[this.path] };
  }

  getTypeName() {
    if (this.dataType === 'enum') {
      return `${this.listKey}${inflection.classify(this.path)}Type`;
    } else if (this.dataType === 'integer') {
      return 'Int';
    } else {
      return 'String';
    }
  }
  getGqlAuxTypes() {
    return this.dataType === 'enum'
      ? [
          `
      enum ${this.getTypeName()} {
        ${this.options.map((i: { value: string }) => i.value).join('\n        ')}
      }
    `,
        ]
      : [];
  }

  gqlQueryInputFields() {
    // TODO: This could be extended for Int type options with numeric filters
    return [
      ...this.equalityInputFields(this.getTypeName()),
      ...this.inInputFields(this.getTypeName()),
    ];
  }
  gqlUpdateInputFields() {
    return [`${this.path}: ${this.getTypeName()}`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: ${this.getTypeName()}`];
  }

  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'string | null' } };
  }
}

export class PrismaSelectInterface<P extends string> extends PrismaFieldAdapter<P> {
  field: Select<P>;
  isUnique: boolean;
  isIndexed: boolean;
  _prismaType: string;
  constructor(
    fieldName: string,
    path: P,
    field: Select<P>,
    listAdapter: PrismaListAdapter,
    getListByKey: (arg: string) => BaseKeystoneList | undefined,
    config = {}
  ) {
    super(fieldName, path, field, listAdapter, getListByKey, config);
    this.field = field;
    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
    this._prismaType =
      this.config.dataType === 'enum' && this.listAdapter.parentAdapter.provider !== 'sqlite'
        ? `${this.field.listKey}${inflection.classify(this.path)}Enum`
        : this.config.dataType === 'integer'
        ? 'Int'
        : 'String';
  }

  getPrismaEnums() {
    if (!['Int', 'String'].includes(this._prismaType)) {
      return [
        `enum ${this._prismaType} {
          ${this.field.options.map((i: { value: string }) => i.value).join('\n')}
        }`,
      ];
    } else return [];
  }

  getPrismaSchema() {
    return [this._schemaField({ type: this._prismaType })];
  }

  getQueryConditions(dbPath: string) {
    return {
      ...this.equalityConditions(dbPath),
      ...this.inConditions(dbPath),
    };
  }
}
