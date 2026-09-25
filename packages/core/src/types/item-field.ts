import type { GArg, GField, GInputType, GOutputType } from '@graphql-ts/schema'
import type { FieldSelection, SelectedItem } from './item-selection.ts'

export const itemFieldsExtension = '@keystone-6/core/itemFields'

// Generic constraints alone allow extra properties on a selection object.
type ExactItemSelection<Item, Selection> = Selection &
  Record<Exclude<keyof Selection, keyof Item>, never>

type Resolver<
  Source,
  Args extends Record<string, GArg<GInputType>>,
  Type extends GOutputType<Context>,
  Context,
> = NonNullable<GField<Source, Args, Type, unknown, Context>['resolve']>

type SelectedFieldConfig<
  Source,
  ResolverSource,
  Args extends Record<string, GArg<GInputType>>,
  Type extends GOutputType<Context>,
  Context,
  Selection,
> = Omit<GField<Source, Args, Type, unknown, Context>, '__missingResolve' | 'resolve'> & {
  select: Selection
  resolve: Resolver<ResolverSource, Args, Type, Context>
}

function withItemFields<
  Source,
  ResolverSource,
  Args extends Record<string, GArg<GInputType>>,
  Type extends GOutputType<Context>,
  Context,
  Selection,
>(
  field: SelectedFieldConfig<Source, ResolverSource, Args, Type, Context, Selection>
): GField<Source, Args, Type, unknown, Context> {
  const { select, ...config } = field
  return {
    ...config,
    extensions: { ...field.extensions, [itemFieldsExtension]: select },
  } as unknown as GField<Source, Args, Type, unknown, Context>
}

/** Construct a GraphQL field on an item, declaring the Prisma item columns it reads. */
export function listItemField<Context>() {
  return function <
    Item,
    const Selection extends FieldSelection<Item>,
    Args extends Record<string, GArg<GInputType>>,
    Type extends GOutputType<Context>,
  >(
    field: SelectedFieldConfig<
      Item,
      SelectedItem<Item, Selection>,
      Args,
      Type,
      Context,
      Selection
    > & {
      select: ExactItemSelection<Item, Selection>
    }
  ): GField<Item, Args, Type, unknown, Context> {
    return withItemFields(field)
  }
}

/** Construct the `output` field for a Keystone field implementation. `select` names Prisma item columns. */
export function keystoneOutputField<Context>() {
  return function <
    Source extends { item: unknown; value: unknown },
    const Selection extends FieldSelection<Source['item']>,
    Args extends Record<string, GArg<GInputType>>,
    Type extends GOutputType<Context>,
  >(
    field: SelectedFieldConfig<
      Source,
      Omit<Source, 'item'> & { item: SelectedItem<Source['item'], Selection> },
      Args,
      Type,
      Context,
      Selection
    > & {
      select: ExactItemSelection<Source['item'], Selection>
    }
  ): GField<Source, Args, Type, unknown, Context> {
    return withItemFields(field)
  }
}

export function fieldItemRequirements(field: { extensions?: unknown }) {
  return (
    field.extensions as
      | { [itemFieldsExtension]?: Readonly<Record<string, true | undefined>> | null }
      | undefined
  )?.[itemFieldsExtension]
}
