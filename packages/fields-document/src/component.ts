import path from 'path';
import {
  BaseListTypeInfo,
  JSONValue,
  FieldTypeFunc,
  CommonFieldConfig,
  jsonFieldTypePolyfilledForSQLite,
} from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';
import { getInitialPropsValue } from './DocumentEditor/component-blocks/initial-values';
import { getOutputGraphQLField } from './component-graphql-output';
import { ComponentPropFieldForGraphQL } from './DocumentEditor/component-blocks/api';
import {
  getGraphQLInputType,
  getValueForCreate,
  getValueForUpdate,
} from './component-graphql-input';
import { assertValidComponentPropField } from './DocumentEditor/component-blocks/field-assertions';
import { addRelationshipDataToComponentProps, fetchRelationshipData } from './relationship-data';

export type ComponentThingFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    db?: { map?: string };
    prop: ComponentPropFieldForGraphQL;
  };

const views = path.join(path.dirname(__dirname), 'component-views');

export const componentThing =
  <ListTypeInfo extends BaseListTypeInfo>({
    prop,
    ...config
  }: ComponentThingFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> =>
  meta => {
    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type component");
    }
    const lists = new Set(Object.keys(meta.lists));
    try {
      assertValidComponentPropField(prop, lists);
    } catch (err) {
      throw new Error(`${meta.listKey}.${meta.fieldKey}: ${(err as any).message}`);
    }

    const resolve = (val: JSONValue | undefined) =>
      val === null && meta.provider === 'postgresql' ? 'JsonNull' : val;

    const defaultValue = getInitialPropsValue(prop);

    const unreferencedConcreteInterfaceImplementations: graphql.ObjectType<any>[] = [];

    const name = meta.listKey + meta.fieldKey[0].toUpperCase() + meta.fieldKey.slice(1);
    return jsonFieldTypePolyfilledForSQLite(
      meta.provider,
      {
        ...config,
        hooks: {
          ...config.hooks,
          resolveInput(args) {
            let val = args.resolvedData[meta.fieldKey];
            if (args.operation === 'update') {
              let prevVal = args.item[meta.fieldKey];
              if (meta.provider === 'sqlite') {
                prevVal = JSON.parse(prevVal as any);
                val = args.inputData[meta.fieldKey];
              }
              val = getValueForUpdate(prop, val, prevVal, args.context, []);
              if (val === null && meta.provider === 'postgresql') {
                val = 'JsonNull';
              }
              if (meta.provider === 'sqlite') {
                val = JSON.stringify(val);
              }
            }

            return config.hooks?.resolveInput
              ? config.hooks.resolveInput({
                  ...args,
                  resolvedData: { ...args.resolvedData, [meta.fieldKey]: val },
                })
              : val;
          },
        },
        input: {
          create: {
            arg: graphql.arg({ type: getGraphQLInputType(name, prop, 'create', new Map(), meta) }),
            async resolve(val, context) {
              return resolve(await getValueForCreate(prop, val, context, []));
            },
          },
          update: {
            arg: graphql.arg({ type: getGraphQLInputType(name, prop, 'update', new Map(), meta) }),
          },
        },
        output: getOutputGraphQLField(
          name,
          prop,
          unreferencedConcreteInterfaceImplementations,
          new Map(),
          meta
        ),
        extraOutputFields: {
          [`${meta.fieldKey}Raw`]: graphql.field({
            type: graphql.JSON,
            args: {
              hydrateRelationships: graphql.arg({
                type: graphql.nonNull(graphql.Boolean),
                defaultValue: false,
              }),
            },
            resolve({ value }, args, context) {
              if (args.hydrateRelationships) {
                return addRelationshipDataToComponentProps(prop, value, (prop, value) =>
                  fetchRelationshipData(
                    context,
                    prop.listKey,
                    prop.many,
                    prop.selection || '',
                    value
                  )
                );
              }
              return value;
            },
          }),
        },
        views,
        getAdminMeta: () => ({}),
        unreferencedConcreteInterfaceImplementations,
      },
      {
        default: {
          kind: 'literal',
          value: JSON.stringify(defaultValue),
        },
        map: config.db?.map,
        mode: 'required',
      }
    );
  };
