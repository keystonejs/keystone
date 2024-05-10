import { graphql } from '@keystone-6/core';

// Define the type for the `FieldForeignListKey` object
export type FieldForeignListKeyType = {
  listKey: string; // The name of the list containing the field
  fieldPath: string; // The path to the specific field
  foreignListKey: string; // The key of the foreign list linked to this field
  foreignLabelPath: string; // The name of the field being used as the label
};

// Create the `FieldForeignListKey` GraphQL object type with its fields
const FieldForeignListKey = graphql.object<FieldForeignListKeyType>()({
  name: "FieldForeignListKey", // Name of the GraphQL object type
  fields: {
    // List key field: string, required (non-null)
    listKey: graphql.field({ type: graphql.nonNull(graphql.String) }),
    // Field path field: string, required (non-null)
    fieldPath: graphql.field({ type: graphql.nonNull(graphql.String) }),
    // Foreign list key field: string, required (non-null)
    foreignListKey: graphql.field({ type: graphql.nonNull(graphql.String) }),
    foreignLabelPath: graphql.field({ type: graphql.nonNull(graphql.String) }),
  },
});

// Static data representing the foreign list keys for various list fields
export const FieldForeignListKeyData: FieldForeignListKeyType[] = [
  {
    listKey: "Post", // The name of the list containing this field
    fieldPath: "tags", // The path to the field within the "Post" list
    foreignListKey: "Tag", // The foreign list linked to this field
    foreignLabelPath: "title", // The foreign list linked to this field
  },
];

// Extend the base GraphQL schema to include a new query field `FieldForeignListKey`
export const extendGraphqlSchema = graphql.extend((base) => {
  return {
    query: {
      // Define a new query field named `FieldForeignListKey`
      FieldForeignListKey: graphql.field({
        type: FieldForeignListKey, // The GraphQL object type to be returned
        args: {
          // Define query arguments: both are required strings
          listKey: graphql.arg({ type: graphql.nonNull(graphql.String) }),
          fieldPath: graphql.arg({ type: graphql.nonNull(graphql.String) }),
        },
        // Resolver function to return the appropriate `FieldForeignListKey` object
        resolve: (_, args) => {
          // Find the object matching the provided listKey and fieldPath
          return FieldForeignListKeyData.find(
            (x) => x.listKey === args.listKey && x.fieldPath === args.fieldPath
          );
        },
      }),
    },
  };
});

// Export the extended schema as the default export
export default extendGraphqlSchema;