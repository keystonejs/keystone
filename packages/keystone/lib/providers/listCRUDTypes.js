/**
 * Helper function to get the static GraphQL Type definitions for the CRUD provider.
 * @param {Object} gqlNames CRUD provider GraphQL type names
 */
const getListCRUDTypes = ({ listsMetaInput }) => [
  `
    """
    NOTE: Can be JSON, or a Boolean/Int/String
    Why not a union? GraphQL doesn't support a union including a scalar
    (https://github.com/facebook/graphql/issues/215)
    """
    scalar JSON
  `,
  `
    type _ListAccess {
      """
      Access Control settings for the currently logged in (or anonymous)
      user when performing 'create' operations.
      NOTE: 'create' can only return a Boolean.
      It is not possible to specify a declarative Where clause for this
      operation
      """
      create: Boolean

      """
      Access Control settings for the currently logged in (or anonymous)
      user when performing 'read' operations.
      """
      read: JSON

      """
      Access Control settings for the currently logged in (or anonymous)
      user when performing 'update' operations.
      """
      update: JSON

      """
      Access Control settings for the currently logged in (or anonymous)
      user when performing 'delete' operations.
      """
      delete: JSON

      """
      Access Control settings for the currently logged in (or anonymous)
      user when performing 'auth' operations.
      """
      auth: JSON
    }
  `,
  `
    type _ListQueries {
      "Single-item query name"
      item: String

      "All-items query name"
      list: String

      "List metadata query name"
      meta: String
    }
  `,
  `
    type _ListMutations {
      "Create mutation name"
      create: String

      "Create many mutation name"
      createMany: String

      "Update mutation name"
      update: String

      "Update many mutation name"
      updateMany: String

      "Delete mutation name"
      delete: String

      "Delete many mutation name"
      deleteMany: String
    }
  `,
  `
    type _ListInputTypes {
      "Input type for matching multiple items"
      whereInput: String

      "Input type for matching a unique item"
      whereUniqueInput: String

      "Create mutation input type name"
      createInput: String

      "Create many mutation input type name"
      createManyInput: String

      "Update mutation name input"
      updateInput: String

      "Update many mutation name input"
      updateManyInput: String
    }
  `,
  `
    type _ListSchemaFields {
      "The path of the field in its list"
      path: String

      "The name of the field in its list"
      name: String @deprecated(reason: "Use \`path\` instead")

      "The field type (ie, Checkbox, Text, etc)"
      type: String
    }
  `,
  `
    type _ListSchemaRelatedFields {
      "The typename as used in GraphQL queries"
      type: String

      "A list of GraphQL field names"
      fields: [String]
    }
  `,
  `
    type _ListSchema {
      "The typename as used in GraphQL queries"
      type: String

      """
      Top level GraphQL query names which either return this type, or
      provide aggregate information about this type
      """
      queries: _ListQueries

      "Top-level GraphQL mutation names"
      mutations: _ListMutations

      "Top-level GraphQL input types"
      inputTypes: _ListInputTypes

      "Information about fields defined on this list"
      fields(where: _ListSchemaFieldsInput): [_ListSchemaFields]

      """
      Information about fields on other types which return this type, or
      provide aggregate information about this type
      """
      relatedFields: [_ListSchemaRelatedFields]
    }
  `,
  `
    type _ListMeta {
      "The Keystone list key"
      key: String

      "The Keystone List name"
      name: String @deprecated(reason: "Use \`key\` instead")

      "The list's user-facing description"
      description: String

      "The list's display name in the Admin UI"
      label: String

      "The list's singular display name"
      singular: String

      "The list's plural display name"
      plural: String

      "The list's data path"
      path: String

      "Access control configuration for the currently authenticated request"
      access: _ListAccess

      "Information on the generated GraphQL schema"
      schema: _ListSchema
    }
  `,
  `
    type _QueryMeta {
      count: Int
    }
  `,
  `
    input ${listsMetaInput} {
      key: String

      "Whether this is an auxiliary helper list"
      auxiliary: Boolean
    }
  `,
  `
    input _ListSchemaFieldsInput {
      type: String
    }
  `,
];

module.exports = { getListCRUDTypes };
