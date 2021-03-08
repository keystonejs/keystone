type Scalars = {
  readonly ID: string;
  readonly Boolean: boolean;
  readonly String: string;
  readonly Int: number;
  readonly Float: number;
  readonly JSON: import('@keystone-next/types').JSONValue;
};

export type UserRelateToOneInput = {
  readonly create?: UserCreateInput | null;
  readonly connect?: UserWhereUniqueInput | null;
  readonly disconnect?: UserWhereUniqueInput | null;
  readonly disconnectAll?: Scalars['Boolean'] | null;
};

export type TodoWhereInput = {
  readonly AND?: ReadonlyArray<TodoWhereInput | null> | null;
  readonly OR?: ReadonlyArray<TodoWhereInput | null> | null;
  readonly id?: Scalars['ID'] | null;
  readonly id_not?: Scalars['ID'] | null;
  readonly id_lt?: Scalars['ID'] | null;
  readonly id_lte?: Scalars['ID'] | null;
  readonly id_gt?: Scalars['ID'] | null;
  readonly id_gte?: Scalars['ID'] | null;
  readonly id_in?: ReadonlyArray<Scalars['ID'] | null> | null;
  readonly id_not_in?: ReadonlyArray<Scalars['ID'] | null> | null;
  readonly label?: Scalars['String'] | null;
  readonly label_not?: Scalars['String'] | null;
  readonly label_contains?: Scalars['String'] | null;
  readonly label_not_contains?: Scalars['String'] | null;
  readonly label_starts_with?: Scalars['String'] | null;
  readonly label_not_starts_with?: Scalars['String'] | null;
  readonly label_ends_with?: Scalars['String'] | null;
  readonly label_not_ends_with?: Scalars['String'] | null;
  readonly label_i?: Scalars['String'] | null;
  readonly label_not_i?: Scalars['String'] | null;
  readonly label_contains_i?: Scalars['String'] | null;
  readonly label_not_contains_i?: Scalars['String'] | null;
  readonly label_starts_with_i?: Scalars['String'] | null;
  readonly label_not_starts_with_i?: Scalars['String'] | null;
  readonly label_ends_with_i?: Scalars['String'] | null;
  readonly label_not_ends_with_i?: Scalars['String'] | null;
  readonly label_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly label_not_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly isComplete?: Scalars['Boolean'] | null;
  readonly isComplete_not?: Scalars['Boolean'] | null;
  readonly assignedTo?: UserWhereInput | null;
  readonly assignedTo_is_null?: Scalars['Boolean'] | null;
  readonly createdBy?: UserWhereInput | null;
  readonly createdBy_is_null?: Scalars['Boolean'] | null;
  readonly finishBy?: Scalars['String'] | null;
  readonly finishBy_not?: Scalars['String'] | null;
  readonly finishBy_lt?: Scalars['String'] | null;
  readonly finishBy_lte?: Scalars['String'] | null;
  readonly finishBy_gt?: Scalars['String'] | null;
  readonly finishBy_gte?: Scalars['String'] | null;
  readonly finishBy_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly finishBy_not_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly createdAt?: Scalars['String'] | null;
  readonly createdAt_not?: Scalars['String'] | null;
  readonly createdAt_lt?: Scalars['String'] | null;
  readonly createdAt_lte?: Scalars['String'] | null;
  readonly createdAt_gt?: Scalars['String'] | null;
  readonly createdAt_gte?: Scalars['String'] | null;
  readonly createdAt_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly createdAt_not_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly updatedAt?: Scalars['String'] | null;
  readonly updatedAt_not?: Scalars['String'] | null;
  readonly updatedAt_lt?: Scalars['String'] | null;
  readonly updatedAt_lte?: Scalars['String'] | null;
  readonly updatedAt_gt?: Scalars['String'] | null;
  readonly updatedAt_gte?: Scalars['String'] | null;
  readonly updatedAt_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly updatedAt_not_in?: ReadonlyArray<Scalars['String'] | null> | null;
};

export type TodoWhereUniqueInput = {
  readonly id: Scalars['ID'];
};

export type SortTodosBy =
  | 'id_ASC'
  | 'id_DESC'
  | 'label_ASC'
  | 'label_DESC'
  | 'isComplete_ASC'
  | 'isComplete_DESC'
  | 'assignedTo_ASC'
  | 'assignedTo_DESC'
  | 'createdBy_ASC'
  | 'createdBy_DESC'
  | 'finishBy_ASC'
  | 'finishBy_DESC'
  | 'createdAt_ASC'
  | 'createdAt_DESC'
  | 'updatedAt_ASC'
  | 'updatedAt_DESC';

export type TodoUpdateInput = {
  readonly label?: Scalars['String'] | null;
  readonly isComplete?: Scalars['Boolean'] | null;
  readonly assignedTo?: UserRelateToOneInput | null;
  readonly createdBy?: UserRelateToOneInput | null;
  readonly finishBy?: Scalars['String'] | null;
};

export type TodosUpdateInput = {
  readonly id: Scalars['ID'];
  readonly data?: TodoUpdateInput | null;
};

export type TodoCreateInput = {
  readonly label?: Scalars['String'] | null;
  readonly isComplete?: Scalars['Boolean'] | null;
  readonly assignedTo?: UserRelateToOneInput | null;
  readonly createdBy?: UserRelateToOneInput | null;
  readonly finishBy?: Scalars['String'] | null;
};

export type TodosCreateInput = {
  readonly data?: TodoCreateInput | null;
};

export type TodoRelateToManyInput = {
  readonly create?: ReadonlyArray<TodoCreateInput | null> | null;
  readonly connect?: ReadonlyArray<TodoWhereUniqueInput | null> | null;
  readonly disconnect?: ReadonlyArray<TodoWhereUniqueInput | null> | null;
  readonly disconnectAll?: Scalars['Boolean'] | null;
};

export type UserWhereInput = {
  readonly AND?: ReadonlyArray<UserWhereInput | null> | null;
  readonly OR?: ReadonlyArray<UserWhereInput | null> | null;
  readonly id?: Scalars['ID'] | null;
  readonly id_not?: Scalars['ID'] | null;
  readonly id_lt?: Scalars['ID'] | null;
  readonly id_lte?: Scalars['ID'] | null;
  readonly id_gt?: Scalars['ID'] | null;
  readonly id_gte?: Scalars['ID'] | null;
  readonly id_in?: ReadonlyArray<Scalars['ID'] | null> | null;
  readonly id_not_in?: ReadonlyArray<Scalars['ID'] | null> | null;
  readonly name?: Scalars['String'] | null;
  readonly name_not?: Scalars['String'] | null;
  readonly name_contains?: Scalars['String'] | null;
  readonly name_not_contains?: Scalars['String'] | null;
  readonly name_starts_with?: Scalars['String'] | null;
  readonly name_not_starts_with?: Scalars['String'] | null;
  readonly name_ends_with?: Scalars['String'] | null;
  readonly name_not_ends_with?: Scalars['String'] | null;
  readonly name_i?: Scalars['String'] | null;
  readonly name_not_i?: Scalars['String'] | null;
  readonly name_contains_i?: Scalars['String'] | null;
  readonly name_not_contains_i?: Scalars['String'] | null;
  readonly name_starts_with_i?: Scalars['String'] | null;
  readonly name_not_starts_with_i?: Scalars['String'] | null;
  readonly name_ends_with_i?: Scalars['String'] | null;
  readonly name_not_ends_with_i?: Scalars['String'] | null;
  readonly name_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly name_not_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly email?: Scalars['String'] | null;
  readonly email_not?: Scalars['String'] | null;
  readonly email_contains?: Scalars['String'] | null;
  readonly email_not_contains?: Scalars['String'] | null;
  readonly email_starts_with?: Scalars['String'] | null;
  readonly email_not_starts_with?: Scalars['String'] | null;
  readonly email_ends_with?: Scalars['String'] | null;
  readonly email_not_ends_with?: Scalars['String'] | null;
  readonly email_i?: Scalars['String'] | null;
  readonly email_not_i?: Scalars['String'] | null;
  readonly email_contains_i?: Scalars['String'] | null;
  readonly email_not_contains_i?: Scalars['String'] | null;
  readonly email_starts_with_i?: Scalars['String'] | null;
  readonly email_not_starts_with_i?: Scalars['String'] | null;
  readonly email_ends_with_i?: Scalars['String'] | null;
  readonly email_not_ends_with_i?: Scalars['String'] | null;
  readonly email_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly email_not_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly password_is_set?: Scalars['Boolean'] | null;
  readonly tasks_every?: TodoWhereInput | null;
  readonly tasks_some?: TodoWhereInput | null;
  readonly tasks_none?: TodoWhereInput | null;
  readonly createdAt?: Scalars['String'] | null;
  readonly createdAt_not?: Scalars['String'] | null;
  readonly createdAt_lt?: Scalars['String'] | null;
  readonly createdAt_lte?: Scalars['String'] | null;
  readonly createdAt_gt?: Scalars['String'] | null;
  readonly createdAt_gte?: Scalars['String'] | null;
  readonly createdAt_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly createdAt_not_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly updatedAt?: Scalars['String'] | null;
  readonly updatedAt_not?: Scalars['String'] | null;
  readonly updatedAt_lt?: Scalars['String'] | null;
  readonly updatedAt_lte?: Scalars['String'] | null;
  readonly updatedAt_gt?: Scalars['String'] | null;
  readonly updatedAt_gte?: Scalars['String'] | null;
  readonly updatedAt_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly updatedAt_not_in?: ReadonlyArray<Scalars['String'] | null> | null;
};

export type UserWhereUniqueInput = {
  readonly id: Scalars['ID'];
};

export type SortUsersBy =
  | 'id_ASC'
  | 'id_DESC'
  | 'name_ASC'
  | 'name_DESC'
  | 'email_ASC'
  | 'email_DESC'
  | 'tasks_ASC'
  | 'tasks_DESC'
  | 'createdAt_ASC'
  | 'createdAt_DESC'
  | 'updatedAt_ASC'
  | 'updatedAt_DESC';

export type UserUpdateInput = {
  readonly name?: Scalars['String'] | null;
  readonly email?: Scalars['String'] | null;
  readonly password?: Scalars['String'] | null;
  readonly tasks?: TodoRelateToManyInput | null;
};

export type UsersUpdateInput = {
  readonly id: Scalars['ID'];
  readonly data?: UserUpdateInput | null;
};

export type UserCreateInput = {
  readonly name?: Scalars['String'] | null;
  readonly email?: Scalars['String'] | null;
  readonly password?: Scalars['String'] | null;
  readonly tasks?: TodoRelateToManyInput | null;
};

export type UsersCreateInput = {
  readonly data?: UserCreateInput | null;
};

export type _ksListsMetaInput = {
  readonly key?: Scalars['String'] | null;
  readonly auxiliary?: Scalars['Boolean'] | null;
};

export type _ListSchemaFieldsInput = {
  readonly type?: Scalars['String'] | null;
};

export type PasswordAuthErrorCode =
  | 'FAILURE'
  | 'IDENTITY_NOT_FOUND'
  | 'SECRET_NOT_SET'
  | 'MULTIPLE_IDENTITY_MATCHES'
  | 'SECRET_MISMATCH';

export type CreateInitialUserInput = {
  readonly name?: Scalars['String'] | null;
  readonly email?: Scalars['String'] | null;
  readonly password?: Scalars['String'] | null;
};

export type KeystoneAdminUIFieldMetaCreateViewFieldMode = 'edit' | 'hidden';

export type KeystoneAdminUIFieldMetaListViewFieldMode = 'read' | 'hidden';

export type KeystoneAdminUIFieldMetaItemViewFieldMode =
  | 'edit'
  | 'read'
  | 'hidden';

export type KeystoneAdminUISortDirection = 'ASC' | 'DESC';

export type TodoListTypeInfo = {
  key: 'Todo';
  fields:
    | 'id'
    | 'label'
    | 'isComplete'
    | 'assignedTo'
    | 'createdBy'
    | 'finishBy'
    | 'createdAt'
    | 'updatedAt';
  backing: {
    readonly id: string;
    readonly label?: string | null;
    readonly isComplete?: boolean | null;
    readonly assignedTo?: string | null;
    readonly createdBy?: string | null;
    readonly finishBy?: Date | null;
    readonly createdAt?: Date | null;
    readonly updatedAt?: Date | null;
  };
  inputs: {
    where: TodoWhereInput;
    create: TodoCreateInput;
    update: TodoUpdateInput;
  };
  args: {
    listQuery: {
      readonly where?: TodoWhereInput | null;
      readonly sortBy?: ReadonlyArray<SortTodosBy> | null;
      readonly first?: Scalars['Int'] | null;
      readonly skip?: Scalars['Int'] | null;
    };
  };
};

export type TodoListFn = (
  listConfig: import('@keystone-next/keystone/schema').ListConfig<
    TodoListTypeInfo,
    TodoListTypeInfo['fields']
  >
) => import('@keystone-next/keystone/schema').ListConfig<
  TodoListTypeInfo,
  TodoListTypeInfo['fields']
>;

export type UserListTypeInfo = {
  key: 'User';
  fields:
    | 'id'
    | 'name'
    | 'email'
    | 'password'
    | 'tasks'
    | 'createdAt'
    | 'updatedAt';
  backing: {
    readonly id: string;
    readonly name?: string | null;
    readonly email?: string | null;
    readonly password?: string | null;
    readonly tasks?: string | null;
    readonly createdAt?: Date | null;
    readonly updatedAt?: Date | null;
  };
  inputs: {
    where: UserWhereInput;
    create: UserCreateInput;
    update: UserUpdateInput;
  };
  args: {
    listQuery: {
      readonly where?: UserWhereInput | null;
      readonly sortBy?: ReadonlyArray<SortUsersBy> | null;
      readonly first?: Scalars['Int'] | null;
      readonly skip?: Scalars['Int'] | null;
    };
  };
};

export type UserListFn = (
  listConfig: import('@keystone-next/keystone/schema').ListConfig<
    UserListTypeInfo,
    UserListTypeInfo['fields']
  >
) => import('@keystone-next/keystone/schema').ListConfig<
  UserListTypeInfo,
  UserListTypeInfo['fields']
>;

export type KeystoneListsTypeInfo = {
  readonly Todo: TodoListTypeInfo;
  readonly User: UserListTypeInfo;
};
