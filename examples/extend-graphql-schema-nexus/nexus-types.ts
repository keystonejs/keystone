/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */


import type { Context } from './keystone-types'




declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  AuthorCreateInput: { // input type
    email?: string | null // String
    name?: string | null // String
    posts?: NexusGenInputs['PostRelateToManyForCreateInput'] | null // PostRelateToManyForCreateInput
  }
  AuthorOrderByInput: { // input type
    email?: NexusGenEnums['OrderDirection'] | null // OrderDirection
    id?: NexusGenEnums['OrderDirection'] | null // OrderDirection
    name?: NexusGenEnums['OrderDirection'] | null // OrderDirection
  }
  AuthorRelateToOneForCreateInput: { // input type
    connect?: NexusGenInputs['AuthorWhereUniqueInput'] | null // AuthorWhereUniqueInput
    create?: NexusGenInputs['AuthorCreateInput'] | null // AuthorCreateInput
  }
  AuthorRelateToOneForUpdateInput: { // input type
    connect?: NexusGenInputs['AuthorWhereUniqueInput'] | null // AuthorWhereUniqueInput
    create?: NexusGenInputs['AuthorCreateInput'] | null // AuthorCreateInput
    disconnect?: boolean | null // Boolean
  }
  AuthorUpdateArgs: { // input type
    data: NexusGenInputs['AuthorUpdateInput'] // AuthorUpdateInput!
    where: NexusGenInputs['AuthorWhereUniqueInput'] // AuthorWhereUniqueInput!
  }
  AuthorUpdateInput: { // input type
    email?: string | null // String
    name?: string | null // String
    posts?: NexusGenInputs['PostRelateToManyForUpdateInput'] | null // PostRelateToManyForUpdateInput
  }
  AuthorWhereInput: { // input type
    AND?: NexusGenInputs['AuthorWhereInput'][] | null // [AuthorWhereInput!]
    NOT?: NexusGenInputs['AuthorWhereInput'][] | null // [AuthorWhereInput!]
    OR?: NexusGenInputs['AuthorWhereInput'][] | null // [AuthorWhereInput!]
    email?: NexusGenInputs['StringFilter'] | null // StringFilter
    id?: NexusGenInputs['IDFilter'] | null // IDFilter
    name?: NexusGenInputs['StringFilter'] | null // StringFilter
    posts?: NexusGenInputs['PostManyRelationFilter'] | null // PostManyRelationFilter
  }
  AuthorWhereUniqueInput: { // input type
    email?: string | null // String
    id?: string | null // ID
  }
  DateTimeNullableFilter: { // input type
    equals?: NexusGenScalars['DateTime'] | null // DateTime
    gt?: NexusGenScalars['DateTime'] | null // DateTime
    gte?: NexusGenScalars['DateTime'] | null // DateTime
    in?: NexusGenScalars['DateTime'][] | null // [DateTime!]
    lt?: NexusGenScalars['DateTime'] | null // DateTime
    lte?: NexusGenScalars['DateTime'] | null // DateTime
    not?: NexusGenInputs['DateTimeNullableFilter'] | null // DateTimeNullableFilter
    notIn?: NexusGenScalars['DateTime'][] | null // [DateTime!]
  }
  IDFilter: { // input type
    equals?: string | null // ID
    gt?: string | null // ID
    gte?: string | null // ID
    in?: string[] | null // [ID!]
    lt?: string | null // ID
    lte?: string | null // ID
    not?: NexusGenInputs['IDFilter'] | null // IDFilter
    notIn?: string[] | null // [ID!]
  }
  NestedStringFilter: { // input type
    contains?: string | null // String
    endsWith?: string | null // String
    equals?: string | null // String
    gt?: string | null // String
    gte?: string | null // String
    in?: string[] | null // [String!]
    lt?: string | null // String
    lte?: string | null // String
    not?: NexusGenInputs['NestedStringFilter'] | null // NestedStringFilter
    notIn?: string[] | null // [String!]
    startsWith?: string | null // String
  }
  PostCreateInput: { // input type
    author?: NexusGenInputs['AuthorRelateToOneForCreateInput'] | null // AuthorRelateToOneForCreateInput
    content?: string | null // String
    publishDate?: NexusGenScalars['DateTime'] | null // DateTime
    status?: NexusGenEnums['PostStatusType'] | null // PostStatusType
    title?: string | null // String
  }
  PostManyRelationFilter: { // input type
    every?: NexusGenInputs['PostWhereInput'] | null // PostWhereInput
    none?: NexusGenInputs['PostWhereInput'] | null // PostWhereInput
    some?: NexusGenInputs['PostWhereInput'] | null // PostWhereInput
  }
  PostOrderByInput: { // input type
    content?: NexusGenEnums['OrderDirection'] | null // OrderDirection
    id?: NexusGenEnums['OrderDirection'] | null // OrderDirection
    publishDate?: NexusGenEnums['OrderDirection'] | null // OrderDirection
    status?: NexusGenEnums['OrderDirection'] | null // OrderDirection
    title?: NexusGenEnums['OrderDirection'] | null // OrderDirection
  }
  PostRelateToManyForCreateInput: { // input type
    connect?: NexusGenInputs['PostWhereUniqueInput'][] | null // [PostWhereUniqueInput!]
    create?: NexusGenInputs['PostCreateInput'][] | null // [PostCreateInput!]
  }
  PostRelateToManyForUpdateInput: { // input type
    connect?: NexusGenInputs['PostWhereUniqueInput'][] | null // [PostWhereUniqueInput!]
    create?: NexusGenInputs['PostCreateInput'][] | null // [PostCreateInput!]
    disconnect?: NexusGenInputs['PostWhereUniqueInput'][] | null // [PostWhereUniqueInput!]
    set?: NexusGenInputs['PostWhereUniqueInput'][] | null // [PostWhereUniqueInput!]
  }
  PostStatusTypeNullableFilter: { // input type
    equals?: NexusGenEnums['PostStatusType'] | null // PostStatusType
    in?: NexusGenEnums['PostStatusType'][] | null // [PostStatusType!]
    not?: NexusGenInputs['PostStatusTypeNullableFilter'] | null // PostStatusTypeNullableFilter
    notIn?: NexusGenEnums['PostStatusType'][] | null // [PostStatusType!]
  }
  PostUpdateArgs: { // input type
    data: NexusGenInputs['PostUpdateInput'] // PostUpdateInput!
    where: NexusGenInputs['PostWhereUniqueInput'] // PostWhereUniqueInput!
  }
  PostUpdateInput: { // input type
    author?: NexusGenInputs['AuthorRelateToOneForUpdateInput'] | null // AuthorRelateToOneForUpdateInput
    content?: string | null // String
    publishDate?: NexusGenScalars['DateTime'] | null // DateTime
    status?: NexusGenEnums['PostStatusType'] | null // PostStatusType
    title?: string | null // String
  }
  PostWhereInput: { // input type
    AND?: NexusGenInputs['PostWhereInput'][] | null // [PostWhereInput!]
    NOT?: NexusGenInputs['PostWhereInput'][] | null // [PostWhereInput!]
    OR?: NexusGenInputs['PostWhereInput'][] | null // [PostWhereInput!]
    author?: NexusGenInputs['AuthorWhereInput'] | null // AuthorWhereInput
    content?: NexusGenInputs['StringFilter'] | null // StringFilter
    id?: NexusGenInputs['IDFilter'] | null // IDFilter
    publishDate?: NexusGenInputs['DateTimeNullableFilter'] | null // DateTimeNullableFilter
    status?: NexusGenInputs['PostStatusTypeNullableFilter'] | null // PostStatusTypeNullableFilter
    title?: NexusGenInputs['StringFilter'] | null // StringFilter
  }
  PostWhereUniqueInput: { // input type
    id?: string | null // ID
  }
  StringFilter: { // input type
    contains?: string | null // String
    endsWith?: string | null // String
    equals?: string | null // String
    gt?: string | null // String
    gte?: string | null // String
    in?: string[] | null // [String!]
    lt?: string | null // String
    lte?: string | null // String
    not?: NexusGenInputs['NestedStringFilter'] | null // NestedStringFilter
    notIn?: string[] | null // [String!]
    startsWith?: string | null // String
  }
}

export interface NexusGenEnums {
  KeystoneAdminUIFieldMetaCreateViewFieldMode: 'edit' | 'hidden'
  KeystoneAdminUIFieldMetaIsNonNull: 'create' | 'read' | 'update'
  KeystoneAdminUIFieldMetaItemViewFieldMode: 'edit' | 'hidden' | 'read'
  KeystoneAdminUIFieldMetaItemViewFieldPosition: 'form' | 'sidebar'
  KeystoneAdminUIFieldMetaListViewFieldMode: 'hidden' | 'read'
  KeystoneAdminUISortDirection: 'ASC' | 'DESC'
  OrderDirection: 'asc' | 'desc'
  PostStatusType: 'draft' | 'published'
  QueryMode: 'default' | 'insensitive'
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
  DateTime: any
  JSON: any
}

export interface NexusGenObjects {
  Author: {}
  KeystoneAdminMeta: { // root type
    lists: NexusGenRootTypes['KeystoneAdminUIListMeta'][] // [KeystoneAdminUIListMeta!]!
  }
  KeystoneAdminUIFieldGroupMeta: { // root type
    description?: string | null // String
    fields: NexusGenRootTypes['KeystoneAdminUIFieldMeta'][] // [KeystoneAdminUIFieldMeta!]!
    label: string // String!
  }
  KeystoneAdminUIFieldMeta: { // root type
    createView: NexusGenRootTypes['KeystoneAdminUIFieldMetaCreateView'] // KeystoneAdminUIFieldMetaCreateView!
    customViewsIndex?: number | null // Int
    description?: string | null // String
    fieldMeta?: NexusGenScalars['JSON'] | null // JSON
    isNonNull?: NexusGenEnums['KeystoneAdminUIFieldMetaIsNonNull'][] | null // [KeystoneAdminUIFieldMetaIsNonNull!]
    label: string // String!
    listView: NexusGenRootTypes['KeystoneAdminUIFieldMetaListView'] // KeystoneAdminUIFieldMetaListView!
    path: string // String!
    search?: NexusGenEnums['QueryMode'] | null // QueryMode
    viewsIndex: number // Int!
  }
  KeystoneAdminUIFieldMetaCreateView: {}
  KeystoneAdminUIFieldMetaItemView: {}
  KeystoneAdminUIFieldMetaListView: {}
  KeystoneAdminUIListMeta: { // root type
    description?: string | null // String
    fields: NexusGenRootTypes['KeystoneAdminUIFieldMeta'][] // [KeystoneAdminUIFieldMeta!]!
    groups: NexusGenRootTypes['KeystoneAdminUIFieldGroupMeta'][] // [KeystoneAdminUIFieldGroupMeta!]!
    initialColumns: string[] // [String!]!
    initialSort?: NexusGenRootTypes['KeystoneAdminUISort'] | null // KeystoneAdminUISort
    isSingleton: boolean // Boolean!
    itemQueryName: string // String!
    key: string // String!
    label: string // String!
    labelField: string // String!
    listQueryName: string // String!
    pageSize: number // Int!
    path: string // String!
    plural: string // String!
    singular: string // String!
  }
  KeystoneAdminUISort: { // root type
    direction: NexusGenEnums['KeystoneAdminUISortDirection'] // KeystoneAdminUISortDirection!
    field: string // String!
  }
  KeystoneMeta: {}
  Mutation: {}
  NexusThing: { // root type
    id?: number | null // Int
    title?: string | null // String
  }
  Post: {}
  Query: {}
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars & NexusGenEnums

export interface NexusGenFieldTypes {
  Author: { // field return type
    email: string | null // String
    id: string // ID!
    name: string | null // String
    posts: NexusGenRootTypes['Post'][] | null // [Post!]
    postsCount: number | null // Int
  }
  KeystoneAdminMeta: { // field return type
    list: NexusGenRootTypes['KeystoneAdminUIListMeta'] | null // KeystoneAdminUIListMeta
    lists: NexusGenRootTypes['KeystoneAdminUIListMeta'][] // [KeystoneAdminUIListMeta!]!
  }
  KeystoneAdminUIFieldGroupMeta: { // field return type
    description: string | null // String
    fields: NexusGenRootTypes['KeystoneAdminUIFieldMeta'][] // [KeystoneAdminUIFieldMeta!]!
    label: string // String!
  }
  KeystoneAdminUIFieldMeta: { // field return type
    createView: NexusGenRootTypes['KeystoneAdminUIFieldMetaCreateView'] // KeystoneAdminUIFieldMetaCreateView!
    customViewsIndex: number | null // Int
    description: string | null // String
    fieldMeta: NexusGenScalars['JSON'] | null // JSON
    isFilterable: boolean // Boolean!
    isNonNull: NexusGenEnums['KeystoneAdminUIFieldMetaIsNonNull'][] | null // [KeystoneAdminUIFieldMetaIsNonNull!]
    isOrderable: boolean // Boolean!
    itemView: NexusGenRootTypes['KeystoneAdminUIFieldMetaItemView'] | null // KeystoneAdminUIFieldMetaItemView
    label: string // String!
    listView: NexusGenRootTypes['KeystoneAdminUIFieldMetaListView'] // KeystoneAdminUIFieldMetaListView!
    path: string // String!
    search: NexusGenEnums['QueryMode'] | null // QueryMode
    viewsIndex: number // Int!
  }
  KeystoneAdminUIFieldMetaCreateView: { // field return type
    fieldMode: NexusGenEnums['KeystoneAdminUIFieldMetaCreateViewFieldMode'] // KeystoneAdminUIFieldMetaCreateViewFieldMode!
  }
  KeystoneAdminUIFieldMetaItemView: { // field return type
    fieldMode: NexusGenEnums['KeystoneAdminUIFieldMetaItemViewFieldMode'] | null // KeystoneAdminUIFieldMetaItemViewFieldMode
    fieldPosition: NexusGenEnums['KeystoneAdminUIFieldMetaItemViewFieldPosition'] | null // KeystoneAdminUIFieldMetaItemViewFieldPosition
  }
  KeystoneAdminUIFieldMetaListView: { // field return type
    fieldMode: NexusGenEnums['KeystoneAdminUIFieldMetaListViewFieldMode'] // KeystoneAdminUIFieldMetaListViewFieldMode!
  }
  KeystoneAdminUIListMeta: { // field return type
    description: string | null // String
    fields: NexusGenRootTypes['KeystoneAdminUIFieldMeta'][] // [KeystoneAdminUIFieldMeta!]!
    groups: NexusGenRootTypes['KeystoneAdminUIFieldGroupMeta'][] // [KeystoneAdminUIFieldGroupMeta!]!
    hideCreate: boolean // Boolean!
    hideDelete: boolean // Boolean!
    initialColumns: string[] // [String!]!
    initialSort: NexusGenRootTypes['KeystoneAdminUISort'] | null // KeystoneAdminUISort
    isHidden: boolean // Boolean!
    isSingleton: boolean // Boolean!
    itemQueryName: string // String!
    key: string // String!
    label: string // String!
    labelField: string // String!
    listQueryName: string // String!
    pageSize: number // Int!
    path: string // String!
    plural: string // String!
    singular: string // String!
  }
  KeystoneAdminUISort: { // field return type
    direction: NexusGenEnums['KeystoneAdminUISortDirection'] // KeystoneAdminUISortDirection!
    field: string // String!
  }
  KeystoneMeta: { // field return type
    adminMeta: NexusGenRootTypes['KeystoneAdminMeta'] // KeystoneAdminMeta!
  }
  Mutation: { // field return type
    createAuthor: NexusGenRootTypes['Author'] | null // Author
    createAuthors: Array<NexusGenRootTypes['Author'] | null> | null // [Author]
    createPost: NexusGenRootTypes['Post'] | null // Post
    createPosts: Array<NexusGenRootTypes['Post'] | null> | null // [Post]
    deleteAuthor: NexusGenRootTypes['Author'] | null // Author
    deleteAuthors: Array<NexusGenRootTypes['Author'] | null> | null // [Author]
    deletePost: NexusGenRootTypes['Post'] | null // Post
    deletePosts: Array<NexusGenRootTypes['Post'] | null> | null // [Post]
    updateAuthor: NexusGenRootTypes['Author'] | null // Author
    updateAuthors: Array<NexusGenRootTypes['Author'] | null> | null // [Author]
    updatePost: NexusGenRootTypes['Post'] | null // Post
    updatePosts: Array<NexusGenRootTypes['Post'] | null> | null // [Post]
  }
  NexusThing: { // field return type
    id: number | null // Int
    title: string | null // String
  }
  Post: { // field return type
    author: NexusGenRootTypes['Author'] | null // Author
    content: string | null // String
    id: string // ID!
    publishDate: NexusGenScalars['DateTime'] | null // DateTime
    status: NexusGenEnums['PostStatusType'] | null // PostStatusType
    title: string | null // String
  }
  Query: { // field return type
    author: NexusGenRootTypes['Author'] | null // Author
    authors: NexusGenRootTypes['Author'][] | null // [Author!]
    authorsCount: number | null // Int
    keystone: NexusGenRootTypes['KeystoneMeta'] // KeystoneMeta!
    nexusPosts: Array<NexusGenRootTypes['Post'] | null> // [Post]!
    post: NexusGenRootTypes['Post'] | null // Post
    posts: NexusGenRootTypes['Post'][] | null // [Post!]
    postsCount: number | null // Int
    things: Array<NexusGenRootTypes['NexusThing'] | null> // [NexusThing]!
  }
}

export interface NexusGenFieldTypeNames {
  Author: { // field return type name
    email: 'String'
    id: 'ID'
    name: 'String'
    posts: 'Post'
    postsCount: 'Int'
  }
  KeystoneAdminMeta: { // field return type name
    list: 'KeystoneAdminUIListMeta'
    lists: 'KeystoneAdminUIListMeta'
  }
  KeystoneAdminUIFieldGroupMeta: { // field return type name
    description: 'String'
    fields: 'KeystoneAdminUIFieldMeta'
    label: 'String'
  }
  KeystoneAdminUIFieldMeta: { // field return type name
    createView: 'KeystoneAdminUIFieldMetaCreateView'
    customViewsIndex: 'Int'
    description: 'String'
    fieldMeta: 'JSON'
    isFilterable: 'Boolean'
    isNonNull: 'KeystoneAdminUIFieldMetaIsNonNull'
    isOrderable: 'Boolean'
    itemView: 'KeystoneAdminUIFieldMetaItemView'
    label: 'String'
    listView: 'KeystoneAdminUIFieldMetaListView'
    path: 'String'
    search: 'QueryMode'
    viewsIndex: 'Int'
  }
  KeystoneAdminUIFieldMetaCreateView: { // field return type name
    fieldMode: 'KeystoneAdminUIFieldMetaCreateViewFieldMode'
  }
  KeystoneAdminUIFieldMetaItemView: { // field return type name
    fieldMode: 'KeystoneAdminUIFieldMetaItemViewFieldMode'
    fieldPosition: 'KeystoneAdminUIFieldMetaItemViewFieldPosition'
  }
  KeystoneAdminUIFieldMetaListView: { // field return type name
    fieldMode: 'KeystoneAdminUIFieldMetaListViewFieldMode'
  }
  KeystoneAdminUIListMeta: { // field return type name
    description: 'String'
    fields: 'KeystoneAdminUIFieldMeta'
    groups: 'KeystoneAdminUIFieldGroupMeta'
    hideCreate: 'Boolean'
    hideDelete: 'Boolean'
    initialColumns: 'String'
    initialSort: 'KeystoneAdminUISort'
    isHidden: 'Boolean'
    isSingleton: 'Boolean'
    itemQueryName: 'String'
    key: 'String'
    label: 'String'
    labelField: 'String'
    listQueryName: 'String'
    pageSize: 'Int'
    path: 'String'
    plural: 'String'
    singular: 'String'
  }
  KeystoneAdminUISort: { // field return type name
    direction: 'KeystoneAdminUISortDirection'
    field: 'String'
  }
  KeystoneMeta: { // field return type name
    adminMeta: 'KeystoneAdminMeta'
  }
  Mutation: { // field return type name
    createAuthor: 'Author'
    createAuthors: 'Author'
    createPost: 'Post'
    createPosts: 'Post'
    deleteAuthor: 'Author'
    deleteAuthors: 'Author'
    deletePost: 'Post'
    deletePosts: 'Post'
    updateAuthor: 'Author'
    updateAuthors: 'Author'
    updatePost: 'Post'
    updatePosts: 'Post'
  }
  NexusThing: { // field return type name
    id: 'Int'
    title: 'String'
  }
  Post: { // field return type name
    author: 'Author'
    content: 'String'
    id: 'ID'
    publishDate: 'DateTime'
    status: 'PostStatusType'
    title: 'String'
  }
  Query: { // field return type name
    author: 'Author'
    authors: 'Author'
    authorsCount: 'Int'
    keystone: 'KeystoneMeta'
    nexusPosts: 'Post'
    post: 'Post'
    posts: 'Post'
    postsCount: 'Int'
    things: 'NexusThing'
  }
}

export interface NexusGenArgTypes {
  Author: {
    posts: { // args
      cursor?: NexusGenInputs['PostWhereUniqueInput'] | null // PostWhereUniqueInput
      orderBy: NexusGenInputs['PostOrderByInput'][] // [PostOrderByInput!]!
      skip: number // Int!
      take?: number | null // Int
      where: NexusGenInputs['PostWhereInput'] // PostWhereInput!
    }
    postsCount: { // args
      where: NexusGenInputs['PostWhereInput'] // PostWhereInput!
    }
  }
  KeystoneAdminMeta: {
    list: { // args
      key: string // String!
    }
  }
  KeystoneAdminUIFieldMeta: {
    itemView: { // args
      id?: string | null // ID
    }
  }
  Mutation: {
    createAuthor: { // args
      data: NexusGenInputs['AuthorCreateInput'] // AuthorCreateInput!
    }
    createAuthors: { // args
      data: NexusGenInputs['AuthorCreateInput'][] // [AuthorCreateInput!]!
    }
    createPost: { // args
      data: NexusGenInputs['PostCreateInput'] // PostCreateInput!
    }
    createPosts: { // args
      data: NexusGenInputs['PostCreateInput'][] // [PostCreateInput!]!
    }
    deleteAuthor: { // args
      where: NexusGenInputs['AuthorWhereUniqueInput'] // AuthorWhereUniqueInput!
    }
    deleteAuthors: { // args
      where: NexusGenInputs['AuthorWhereUniqueInput'][] // [AuthorWhereUniqueInput!]!
    }
    deletePost: { // args
      where: NexusGenInputs['PostWhereUniqueInput'] // PostWhereUniqueInput!
    }
    deletePosts: { // args
      where: NexusGenInputs['PostWhereUniqueInput'][] // [PostWhereUniqueInput!]!
    }
    updateAuthor: { // args
      data: NexusGenInputs['AuthorUpdateInput'] // AuthorUpdateInput!
      where: NexusGenInputs['AuthorWhereUniqueInput'] // AuthorWhereUniqueInput!
    }
    updateAuthors: { // args
      data: NexusGenInputs['AuthorUpdateArgs'][] // [AuthorUpdateArgs!]!
    }
    updatePost: { // args
      data: NexusGenInputs['PostUpdateInput'] // PostUpdateInput!
      where: NexusGenInputs['PostWhereUniqueInput'] // PostWhereUniqueInput!
    }
    updatePosts: { // args
      data: NexusGenInputs['PostUpdateArgs'][] // [PostUpdateArgs!]!
    }
  }
  Query: {
    author: { // args
      where: NexusGenInputs['AuthorWhereUniqueInput'] // AuthorWhereUniqueInput!
    }
    authors: { // args
      cursor?: NexusGenInputs['AuthorWhereUniqueInput'] | null // AuthorWhereUniqueInput
      orderBy: NexusGenInputs['AuthorOrderByInput'][] // [AuthorOrderByInput!]!
      skip: number // Int!
      take?: number | null // Int
      where: NexusGenInputs['AuthorWhereInput'] // AuthorWhereInput!
    }
    authorsCount: { // args
      where: NexusGenInputs['AuthorWhereInput'] // AuthorWhereInput!
    }
    nexusPosts: { // args
      id: string // String!
      seconds: number // Int!
    }
    post: { // args
      where: NexusGenInputs['PostWhereUniqueInput'] // PostWhereUniqueInput!
    }
    posts: { // args
      cursor?: NexusGenInputs['PostWhereUniqueInput'] | null // PostWhereUniqueInput
      orderBy: NexusGenInputs['PostOrderByInput'][] // [PostOrderByInput!]!
      skip: number // Int!
      take?: number | null // Int
      where: NexusGenInputs['PostWhereInput'] // PostWhereInput!
    }
    postsCount: { // args
      where: NexusGenInputs['PostWhereInput'] // PostWhereInput!
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects

export type NexusGenInputNames = keyof NexusGenInputs

export type NexusGenEnumNames = keyof NexusGenEnums

export type NexusGenInterfaceNames = never

export type NexusGenScalarNames = keyof NexusGenScalars

export type NexusGenUnionNames = never

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never

export type NexusGenAbstractsUsingStrategyResolveType = never

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: Context
  inputTypes: NexusGenInputs
  rootTypes: NexusGenRootTypes
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars
  argTypes: NexusGenArgTypes
  fieldTypes: NexusGenFieldTypes
  fieldTypeNames: NexusGenFieldTypeNames
  allTypes: NexusGenAllTypes
  typeInterfaces: NexusGenTypeInterfaces
  objectNames: NexusGenObjectNames
  inputNames: NexusGenInputNames
  enumNames: NexusGenEnumNames
  interfaceNames: NexusGenInterfaceNames
  scalarNames: NexusGenScalarNames
  unionNames: NexusGenUnionNames
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames']
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames']
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames']
  abstractTypeMembers: NexusGenAbstractTypeMembers
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType
  features: NexusGenFeaturesConfig
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}