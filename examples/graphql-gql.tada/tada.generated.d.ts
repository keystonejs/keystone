/* eslint-disable */
/* prettier-ignore */

export type introspection_types = {
    'Author': { kind: 'OBJECT'; name: 'Author'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'latestPost': { name: 'latestPost'; type: { kind: 'OBJECT'; name: 'Post'; ofType: null; } }; 'name': { name: 'name'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'posts': { name: 'posts'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Post'; ofType: null; }; }; } }; 'postsCount': { name: 'postsCount'; type: { kind: 'SCALAR'; name: 'Int'; ofType: null; } }; }; };
    'AuthorCreateInput': { kind: 'INPUT_OBJECT'; name: 'AuthorCreateInput'; isOneOf: false; inputFields: [{ name: 'name'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'posts'; type: { kind: 'INPUT_OBJECT'; name: 'PostRelateToManyForCreateInput'; ofType: null; }; defaultValue: null }]; };
    'AuthorOrderByInput': { kind: 'INPUT_OBJECT'; name: 'AuthorOrderByInput'; isOneOf: false; inputFields: [{ name: 'id'; type: { kind: 'ENUM'; name: 'OrderDirection'; ofType: null; }; defaultValue: null }, { name: 'name'; type: { kind: 'ENUM'; name: 'OrderDirection'; ofType: null; }; defaultValue: null }]; };
    'AuthorRelateToOneForCreateInput': { kind: 'INPUT_OBJECT'; name: 'AuthorRelateToOneForCreateInput'; isOneOf: false; inputFields: [{ name: 'create'; type: { kind: 'INPUT_OBJECT'; name: 'AuthorCreateInput'; ofType: null; }; defaultValue: null }, { name: 'connect'; type: { kind: 'INPUT_OBJECT'; name: 'AuthorWhereUniqueInput'; ofType: null; }; defaultValue: null }]; };
    'AuthorRelateToOneForUpdateInput': { kind: 'INPUT_OBJECT'; name: 'AuthorRelateToOneForUpdateInput'; isOneOf: false; inputFields: [{ name: 'create'; type: { kind: 'INPUT_OBJECT'; name: 'AuthorCreateInput'; ofType: null; }; defaultValue: null }, { name: 'connect'; type: { kind: 'INPUT_OBJECT'; name: 'AuthorWhereUniqueInput'; ofType: null; }; defaultValue: null }, { name: 'disconnect'; type: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; defaultValue: null }]; };
    'AuthorUpdateArgs': { kind: 'INPUT_OBJECT'; name: 'AuthorUpdateArgs'; isOneOf: false; inputFields: [{ name: 'where'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'INPUT_OBJECT'; name: 'AuthorWhereUniqueInput'; ofType: null; }; }; defaultValue: null }, { name: 'data'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'INPUT_OBJECT'; name: 'AuthorUpdateInput'; ofType: null; }; }; defaultValue: null }]; };
    'AuthorUpdateInput': { kind: 'INPUT_OBJECT'; name: 'AuthorUpdateInput'; isOneOf: false; inputFields: [{ name: 'name'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'posts'; type: { kind: 'INPUT_OBJECT'; name: 'PostRelateToManyForUpdateInput'; ofType: null; }; defaultValue: null }]; };
    'AuthorWhereInput': { kind: 'INPUT_OBJECT'; name: 'AuthorWhereInput'; isOneOf: false; inputFields: [{ name: 'AND'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'INPUT_OBJECT'; name: 'AuthorWhereInput'; ofType: null; }; }; }; defaultValue: null }, { name: 'OR'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'INPUT_OBJECT'; name: 'AuthorWhereInput'; ofType: null; }; }; }; defaultValue: null }, { name: 'NOT'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'INPUT_OBJECT'; name: 'AuthorWhereInput'; ofType: null; }; }; }; defaultValue: null }, { name: 'id'; type: { kind: 'INPUT_OBJECT'; name: 'IDFilter'; ofType: null; }; defaultValue: null }, { name: 'name'; type: { kind: 'INPUT_OBJECT'; name: 'StringFilter'; ofType: null; }; defaultValue: null }, { name: 'posts'; type: { kind: 'INPUT_OBJECT'; name: 'PostManyRelationFilter'; ofType: null; }; defaultValue: null }]; };
    'AuthorWhereUniqueInput': { kind: 'INPUT_OBJECT'; name: 'AuthorWhereUniqueInput'; isOneOf: false; inputFields: [{ name: 'id'; type: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; defaultValue: null }]; };
    'Boolean': unknown;
    'DateTime': unknown;
    'DateTimeFilter': { kind: 'INPUT_OBJECT'; name: 'DateTimeFilter'; isOneOf: false; inputFields: [{ name: 'equals'; type: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; }; defaultValue: null }, { name: 'in'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; }; }; }; defaultValue: null }, { name: 'notIn'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; }; }; }; defaultValue: null }, { name: 'lt'; type: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; }; defaultValue: null }, { name: 'lte'; type: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; }; defaultValue: null }, { name: 'gt'; type: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; }; defaultValue: null }, { name: 'gte'; type: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; }; defaultValue: null }, { name: 'not'; type: { kind: 'INPUT_OBJECT'; name: 'DateTimeFilter'; ofType: null; }; defaultValue: null }]; };
    'ID': unknown;
    'IDFilter': { kind: 'INPUT_OBJECT'; name: 'IDFilter'; isOneOf: false; inputFields: [{ name: 'equals'; type: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; defaultValue: null }, { name: 'in'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; }; }; defaultValue: null }, { name: 'notIn'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; }; }; defaultValue: null }, { name: 'lt'; type: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; defaultValue: null }, { name: 'lte'; type: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; defaultValue: null }, { name: 'gt'; type: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; defaultValue: null }, { name: 'gte'; type: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; defaultValue: null }, { name: 'not'; type: { kind: 'INPUT_OBJECT'; name: 'IDFilter'; ofType: null; }; defaultValue: null }]; };
    'Int': unknown;
    'JSON': unknown;
    'KeystoneAdminMeta': { kind: 'OBJECT'; name: 'KeystoneAdminMeta'; fields: { 'list': { name: 'list'; type: { kind: 'OBJECT'; name: 'KeystoneAdminUIListMeta'; ofType: null; } }; 'lists': { name: 'lists'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'KeystoneAdminUIListMeta'; ofType: null; }; }; }; } }; }; };
    'KeystoneAdminUIFieldGroupMeta': { kind: 'OBJECT'; name: 'KeystoneAdminUIFieldGroupMeta'; fields: { 'description': { name: 'description'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'fields': { name: 'fields'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'KeystoneAdminUIFieldMeta'; ofType: null; }; }; }; } }; 'label': { name: 'label'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'KeystoneAdminUIFieldMeta': { kind: 'OBJECT'; name: 'KeystoneAdminUIFieldMeta'; fields: { 'createView': { name: 'createView'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'KeystoneAdminUIFieldMetaCreateView'; ofType: null; }; } }; 'customViewsIndex': { name: 'customViewsIndex'; type: { kind: 'SCALAR'; name: 'Int'; ofType: null; } }; 'description': { name: 'description'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'fieldMeta': { name: 'fieldMeta'; type: { kind: 'SCALAR'; name: 'JSON'; ofType: null; } }; 'isFilterable': { name: 'isFilterable'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'isNonNull': { name: 'isNonNull'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'ENUM'; name: 'KeystoneAdminUIFieldMetaIsNonNull'; ofType: null; }; }; } }; 'isOrderable': { name: 'isOrderable'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'itemView': { name: 'itemView'; type: { kind: 'OBJECT'; name: 'KeystoneAdminUIFieldMetaItemView'; ofType: null; } }; 'label': { name: 'label'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'listView': { name: 'listView'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'KeystoneAdminUIFieldMetaListView'; ofType: null; }; } }; 'path': { name: 'path'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'search': { name: 'search'; type: { kind: 'ENUM'; name: 'QueryMode'; ofType: null; } }; 'viewsIndex': { name: 'viewsIndex'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; }; };
    'KeystoneAdminUIFieldMetaCreateView': { kind: 'OBJECT'; name: 'KeystoneAdminUIFieldMetaCreateView'; fields: { 'fieldMode': { name: 'fieldMode'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'ENUM'; name: 'KeystoneAdminUIFieldMetaCreateViewFieldMode'; ofType: null; }; } }; }; };
    'KeystoneAdminUIFieldMetaCreateViewFieldMode': { name: 'KeystoneAdminUIFieldMetaCreateViewFieldMode'; enumValues: 'edit' | 'hidden'; };
    'KeystoneAdminUIFieldMetaIsNonNull': { name: 'KeystoneAdminUIFieldMetaIsNonNull'; enumValues: 'read' | 'create' | 'update'; };
    'KeystoneAdminUIFieldMetaItemView': { kind: 'OBJECT'; name: 'KeystoneAdminUIFieldMetaItemView'; fields: { 'fieldMode': { name: 'fieldMode'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'ENUM'; name: 'KeystoneAdminUIFieldMetaItemViewFieldMode'; ofType: null; }; } }; 'fieldPosition': { name: 'fieldPosition'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'ENUM'; name: 'KeystoneAdminUIFieldMetaItemViewFieldPosition'; ofType: null; }; } }; }; };
    'KeystoneAdminUIFieldMetaItemViewFieldMode': { name: 'KeystoneAdminUIFieldMetaItemViewFieldMode'; enumValues: 'edit' | 'read' | 'hidden'; };
    'KeystoneAdminUIFieldMetaItemViewFieldPosition': { name: 'KeystoneAdminUIFieldMetaItemViewFieldPosition'; enumValues: 'form' | 'sidebar'; };
    'KeystoneAdminUIFieldMetaListView': { kind: 'OBJECT'; name: 'KeystoneAdminUIFieldMetaListView'; fields: { 'fieldMode': { name: 'fieldMode'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'ENUM'; name: 'KeystoneAdminUIFieldMetaListViewFieldMode'; ofType: null; }; } }; }; };
    'KeystoneAdminUIFieldMetaListViewFieldMode': { name: 'KeystoneAdminUIFieldMetaListViewFieldMode'; enumValues: 'read' | 'hidden'; };
    'KeystoneAdminUIGraphQL': { kind: 'OBJECT'; name: 'KeystoneAdminUIGraphQL'; fields: { 'names': { name: 'names'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'KeystoneAdminUIGraphQLNames'; ofType: null; }; } }; }; };
    'KeystoneAdminUIGraphQLNames': { kind: 'OBJECT'; name: 'KeystoneAdminUIGraphQLNames'; fields: { 'createInputName': { name: 'createInputName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'createManyMutationName': { name: 'createManyMutationName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'createMutationName': { name: 'createMutationName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'deleteManyMutationName': { name: 'deleteManyMutationName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'deleteMutationName': { name: 'deleteMutationName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'itemQueryName': { name: 'itemQueryName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'listOrderName': { name: 'listOrderName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'listQueryCountName': { name: 'listQueryCountName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'listQueryName': { name: 'listQueryName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'outputTypeName': { name: 'outputTypeName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'relateToManyForCreateInputName': { name: 'relateToManyForCreateInputName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'relateToManyForUpdateInputName': { name: 'relateToManyForUpdateInputName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'relateToOneForCreateInputName': { name: 'relateToOneForCreateInputName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'relateToOneForUpdateInputName': { name: 'relateToOneForUpdateInputName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'updateInputName': { name: 'updateInputName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'updateManyInputName': { name: 'updateManyInputName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'updateManyMutationName': { name: 'updateManyMutationName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'updateMutationName': { name: 'updateMutationName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'whereInputName': { name: 'whereInputName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'whereUniqueInputName': { name: 'whereUniqueInputName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'KeystoneAdminUIListMeta': { kind: 'OBJECT'; name: 'KeystoneAdminUIListMeta'; fields: { 'description': { name: 'description'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'fields': { name: 'fields'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'KeystoneAdminUIFieldMeta'; ofType: null; }; }; }; } }; 'graphql': { name: 'graphql'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'KeystoneAdminUIGraphQL'; ofType: null; }; } }; 'groups': { name: 'groups'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'KeystoneAdminUIFieldGroupMeta'; ofType: null; }; }; }; } }; 'hideCreate': { name: 'hideCreate'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'hideDelete': { name: 'hideDelete'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'hideNavigation': { name: 'hideNavigation'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'initialColumns': { name: 'initialColumns'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; }; } }; 'initialSearchFields': { name: 'initialSearchFields'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; }; } }; 'initialSort': { name: 'initialSort'; type: { kind: 'OBJECT'; name: 'KeystoneAdminUISort'; ofType: null; } }; 'isSingleton': { name: 'isSingleton'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'key': { name: 'key'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'label': { name: 'label'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'labelField': { name: 'labelField'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'pageSize': { name: 'pageSize'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'path': { name: 'path'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'plural': { name: 'plural'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'singular': { name: 'singular'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'KeystoneAdminUISort': { kind: 'OBJECT'; name: 'KeystoneAdminUISort'; fields: { 'direction': { name: 'direction'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'ENUM'; name: 'KeystoneAdminUISortDirection'; ofType: null; }; } }; 'field': { name: 'field'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'KeystoneAdminUISortDirection': { name: 'KeystoneAdminUISortDirection'; enumValues: 'ASC' | 'DESC'; };
    'KeystoneMeta': { kind: 'OBJECT'; name: 'KeystoneMeta'; fields: { 'adminMeta': { name: 'adminMeta'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'KeystoneAdminMeta'; ofType: null; }; } }; }; };
    'Mutation': { kind: 'OBJECT'; name: 'Mutation'; fields: { 'createAuthor': { name: 'createAuthor'; type: { kind: 'OBJECT'; name: 'Author'; ofType: null; } }; 'createAuthors': { name: 'createAuthors'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'Author'; ofType: null; }; } }; 'createPost': { name: 'createPost'; type: { kind: 'OBJECT'; name: 'Post'; ofType: null; } }; 'createPosts': { name: 'createPosts'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'Post'; ofType: null; }; } }; 'deleteAuthor': { name: 'deleteAuthor'; type: { kind: 'OBJECT'; name: 'Author'; ofType: null; } }; 'deleteAuthors': { name: 'deleteAuthors'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'Author'; ofType: null; }; } }; 'deletePost': { name: 'deletePost'; type: { kind: 'OBJECT'; name: 'Post'; ofType: null; } }; 'deletePosts': { name: 'deletePosts'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'Post'; ofType: null; }; } }; 'updateAuthor': { name: 'updateAuthor'; type: { kind: 'OBJECT'; name: 'Author'; ofType: null; } }; 'updateAuthors': { name: 'updateAuthors'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'Author'; ofType: null; }; } }; 'updatePost': { name: 'updatePost'; type: { kind: 'OBJECT'; name: 'Post'; ofType: null; } }; 'updatePosts': { name: 'updatePosts'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'Post'; ofType: null; }; } }; }; };
    'NestedStringFilter': { kind: 'INPUT_OBJECT'; name: 'NestedStringFilter'; isOneOf: false; inputFields: [{ name: 'equals'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'in'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; }; defaultValue: null }, { name: 'notIn'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; }; defaultValue: null }, { name: 'lt'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'lte'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'gt'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'gte'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'contains'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'startsWith'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'endsWith'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'not'; type: { kind: 'INPUT_OBJECT'; name: 'NestedStringFilter'; ofType: null; }; defaultValue: null }]; };
    'OrderDirection': { name: 'OrderDirection'; enumValues: 'asc' | 'desc'; };
    'Post': { kind: 'OBJECT'; name: 'Post'; fields: { 'author': { name: 'author'; type: { kind: 'OBJECT'; name: 'Author'; ofType: null; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'publishDate': { name: 'publishDate'; type: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; } }; 'title': { name: 'title'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; }; };
    'PostCreateInput': { kind: 'INPUT_OBJECT'; name: 'PostCreateInput'; isOneOf: false; inputFields: [{ name: 'title'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'publishDate'; type: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; }; defaultValue: null }, { name: 'author'; type: { kind: 'INPUT_OBJECT'; name: 'AuthorRelateToOneForCreateInput'; ofType: null; }; defaultValue: null }]; };
    'PostManyRelationFilter': { kind: 'INPUT_OBJECT'; name: 'PostManyRelationFilter'; isOneOf: false; inputFields: [{ name: 'every'; type: { kind: 'INPUT_OBJECT'; name: 'PostWhereInput'; ofType: null; }; defaultValue: null }, { name: 'some'; type: { kind: 'INPUT_OBJECT'; name: 'PostWhereInput'; ofType: null; }; defaultValue: null }, { name: 'none'; type: { kind: 'INPUT_OBJECT'; name: 'PostWhereInput'; ofType: null; }; defaultValue: null }]; };
    'PostOrderByInput': { kind: 'INPUT_OBJECT'; name: 'PostOrderByInput'; isOneOf: false; inputFields: [{ name: 'id'; type: { kind: 'ENUM'; name: 'OrderDirection'; ofType: null; }; defaultValue: null }, { name: 'title'; type: { kind: 'ENUM'; name: 'OrderDirection'; ofType: null; }; defaultValue: null }, { name: 'publishDate'; type: { kind: 'ENUM'; name: 'OrderDirection'; ofType: null; }; defaultValue: null }]; };
    'PostRelateToManyForCreateInput': { kind: 'INPUT_OBJECT'; name: 'PostRelateToManyForCreateInput'; isOneOf: false; inputFields: [{ name: 'create'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'INPUT_OBJECT'; name: 'PostCreateInput'; ofType: null; }; }; }; defaultValue: null }, { name: 'connect'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'INPUT_OBJECT'; name: 'PostWhereUniqueInput'; ofType: null; }; }; }; defaultValue: null }]; };
    'PostRelateToManyForUpdateInput': { kind: 'INPUT_OBJECT'; name: 'PostRelateToManyForUpdateInput'; isOneOf: false; inputFields: [{ name: 'disconnect'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'INPUT_OBJECT'; name: 'PostWhereUniqueInput'; ofType: null; }; }; }; defaultValue: null }, { name: 'set'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'INPUT_OBJECT'; name: 'PostWhereUniqueInput'; ofType: null; }; }; }; defaultValue: null }, { name: 'create'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'INPUT_OBJECT'; name: 'PostCreateInput'; ofType: null; }; }; }; defaultValue: null }, { name: 'connect'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'INPUT_OBJECT'; name: 'PostWhereUniqueInput'; ofType: null; }; }; }; defaultValue: null }]; };
    'PostUpdateArgs': { kind: 'INPUT_OBJECT'; name: 'PostUpdateArgs'; isOneOf: false; inputFields: [{ name: 'where'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'INPUT_OBJECT'; name: 'PostWhereUniqueInput'; ofType: null; }; }; defaultValue: null }, { name: 'data'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'INPUT_OBJECT'; name: 'PostUpdateInput'; ofType: null; }; }; defaultValue: null }]; };
    'PostUpdateInput': { kind: 'INPUT_OBJECT'; name: 'PostUpdateInput'; isOneOf: false; inputFields: [{ name: 'title'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'publishDate'; type: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; }; defaultValue: null }, { name: 'author'; type: { kind: 'INPUT_OBJECT'; name: 'AuthorRelateToOneForUpdateInput'; ofType: null; }; defaultValue: null }]; };
    'PostWhereInput': { kind: 'INPUT_OBJECT'; name: 'PostWhereInput'; isOneOf: false; inputFields: [{ name: 'AND'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'INPUT_OBJECT'; name: 'PostWhereInput'; ofType: null; }; }; }; defaultValue: null }, { name: 'OR'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'INPUT_OBJECT'; name: 'PostWhereInput'; ofType: null; }; }; }; defaultValue: null }, { name: 'NOT'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'INPUT_OBJECT'; name: 'PostWhereInput'; ofType: null; }; }; }; defaultValue: null }, { name: 'id'; type: { kind: 'INPUT_OBJECT'; name: 'IDFilter'; ofType: null; }; defaultValue: null }, { name: 'title'; type: { kind: 'INPUT_OBJECT'; name: 'StringFilter'; ofType: null; }; defaultValue: null }, { name: 'publishDate'; type: { kind: 'INPUT_OBJECT'; name: 'DateTimeFilter'; ofType: null; }; defaultValue: null }, { name: 'author'; type: { kind: 'INPUT_OBJECT'; name: 'AuthorWhereInput'; ofType: null; }; defaultValue: null }]; };
    'PostWhereUniqueInput': { kind: 'INPUT_OBJECT'; name: 'PostWhereUniqueInput'; isOneOf: false; inputFields: [{ name: 'id'; type: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; defaultValue: null }]; };
    'Query': { kind: 'OBJECT'; name: 'Query'; fields: { 'author': { name: 'author'; type: { kind: 'OBJECT'; name: 'Author'; ofType: null; } }; 'authors': { name: 'authors'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Author'; ofType: null; }; }; } }; 'authorsCount': { name: 'authorsCount'; type: { kind: 'SCALAR'; name: 'Int'; ofType: null; } }; 'keystone': { name: 'keystone'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'KeystoneMeta'; ofType: null; }; } }; 'post': { name: 'post'; type: { kind: 'OBJECT'; name: 'Post'; ofType: null; } }; 'posts': { name: 'posts'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Post'; ofType: null; }; }; } }; 'postsCount': { name: 'postsCount'; type: { kind: 'SCALAR'; name: 'Int'; ofType: null; } }; }; };
    'QueryMode': { name: 'QueryMode'; enumValues: 'default' | 'insensitive'; };
    'String': unknown;
    'StringFilter': { kind: 'INPUT_OBJECT'; name: 'StringFilter'; isOneOf: false; inputFields: [{ name: 'equals'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'in'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; }; defaultValue: null }, { name: 'notIn'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; }; defaultValue: null }, { name: 'lt'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'lte'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'gt'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'gte'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'contains'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'startsWith'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'endsWith'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'not'; type: { kind: 'INPUT_OBJECT'; name: 'NestedStringFilter'; ofType: null; }; defaultValue: null }]; };
};

/** An IntrospectionQuery representation of your schema.
 *
 * @remarks
 * This is an introspection of your schema saved as a file by GraphQLSP.
 * It will automatically be used by `gql.tada` to infer the types of your GraphQL documents.
 * If you need to reuse this data or update your `scalars`, update `tadaOutputLocation` to
 * instead save to a .ts instead of a .d.ts file.
 */
export type introspection = {
  name: 'keystone';
  query: 'Query';
  mutation: 'Mutation';
  subscription: never;
  types: introspection_types;
};

import * as gqlTada from 'gql.tada';
