type Scalars = {
  readonly ID: string;
  readonly Boolean: boolean;
  readonly String: string;
  readonly Int: number;
  readonly Float: number;
  readonly JSON: import('@keystone-next/types').JSONValue;
};

export type PhoneNumberRelateToManyInput = {
  readonly create?: ReadonlyArray<PhoneNumberCreateInput | null> | null;
  readonly connect?: ReadonlyArray<PhoneNumberWhereUniqueInput | null> | null;
  readonly disconnect?: ReadonlyArray<PhoneNumberWhereUniqueInput | null> | null;
  readonly disconnectAll?: Scalars['Boolean'] | null;
};

export type PostRelateToManyInput = {
  readonly create?: ReadonlyArray<PostCreateInput | null> | null;
  readonly connect?: ReadonlyArray<PostWhereUniqueInput | null> | null;
  readonly disconnect?: ReadonlyArray<PostWhereUniqueInput | null> | null;
  readonly disconnectAll?: Scalars['Boolean'] | null;
};

export type UserWhereInput = {
  readonly AND?: ReadonlyArray<UserWhereInput | null> | null;
  readonly OR?: ReadonlyArray<UserWhereInput | null> | null;
  readonly id?: Scalars['ID'] | null;
  readonly id_not?: Scalars['ID'] | null;
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
  readonly isAdmin?: Scalars['Boolean'] | null;
  readonly isAdmin_not?: Scalars['Boolean'] | null;
  readonly roles?: Scalars['String'] | null;
  readonly roles_not?: Scalars['String'] | null;
  readonly roles_contains?: Scalars['String'] | null;
  readonly roles_not_contains?: Scalars['String'] | null;
  readonly roles_starts_with?: Scalars['String'] | null;
  readonly roles_not_starts_with?: Scalars['String'] | null;
  readonly roles_ends_with?: Scalars['String'] | null;
  readonly roles_not_ends_with?: Scalars['String'] | null;
  readonly roles_i?: Scalars['String'] | null;
  readonly roles_not_i?: Scalars['String'] | null;
  readonly roles_contains_i?: Scalars['String'] | null;
  readonly roles_not_contains_i?: Scalars['String'] | null;
  readonly roles_starts_with_i?: Scalars['String'] | null;
  readonly roles_not_starts_with_i?: Scalars['String'] | null;
  readonly roles_ends_with_i?: Scalars['String'] | null;
  readonly roles_not_ends_with_i?: Scalars['String'] | null;
  readonly roles_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly roles_not_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly phoneNumbers_every?: PhoneNumberWhereInput | null;
  readonly phoneNumbers_some?: PhoneNumberWhereInput | null;
  readonly phoneNumbers_none?: PhoneNumberWhereInput | null;
  readonly posts_every?: PostWhereInput | null;
  readonly posts_some?: PostWhereInput | null;
  readonly posts_none?: PostWhereInput | null;
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
  | 'isAdmin_ASC'
  | 'isAdmin_DESC'
  | 'roles_ASC'
  | 'roles_DESC'
  | 'phoneNumbers_ASC'
  | 'phoneNumbers_DESC'
  | 'posts_ASC'
  | 'posts_DESC';

export type UserUpdateInput = {
  readonly name?: Scalars['String'] | null;
  readonly email?: Scalars['String'] | null;
  readonly password?: Scalars['String'] | null;
  readonly isAdmin?: Scalars['Boolean'] | null;
  readonly roles?: Scalars['String'] | null;
  readonly phoneNumbers?: PhoneNumberRelateToManyInput | null;
  readonly posts?: PostRelateToManyInput | null;
};

export type UsersUpdateInput = {
  readonly id: Scalars['ID'];
  readonly data?: UserUpdateInput | null;
};

export type UserCreateInput = {
  readonly name?: Scalars['String'] | null;
  readonly email?: Scalars['String'] | null;
  readonly password?: Scalars['String'] | null;
  readonly isAdmin?: Scalars['Boolean'] | null;
  readonly roles?: Scalars['String'] | null;
  readonly phoneNumbers?: PhoneNumberRelateToManyInput | null;
  readonly posts?: PostRelateToManyInput | null;
};

export type UsersCreateInput = {
  readonly data?: UserCreateInput | null;
};

export type UserRelateToOneInput = {
  readonly create?: UserCreateInput | null;
  readonly connect?: UserWhereUniqueInput | null;
  readonly disconnect?: UserWhereUniqueInput | null;
  readonly disconnectAll?: Scalars['Boolean'] | null;
};

export type PhoneNumberWhereInput = {
  readonly AND?: ReadonlyArray<PhoneNumberWhereInput | null> | null;
  readonly OR?: ReadonlyArray<PhoneNumberWhereInput | null> | null;
  readonly id?: Scalars['ID'] | null;
  readonly id_not?: Scalars['ID'] | null;
  readonly id_in?: ReadonlyArray<Scalars['ID'] | null> | null;
  readonly id_not_in?: ReadonlyArray<Scalars['ID'] | null> | null;
  readonly user?: UserWhereInput | null;
  readonly user_is_null?: Scalars['Boolean'] | null;
  readonly type?: Scalars['String'] | null;
  readonly type_not?: Scalars['String'] | null;
  readonly type_contains?: Scalars['String'] | null;
  readonly type_not_contains?: Scalars['String'] | null;
  readonly type_starts_with?: Scalars['String'] | null;
  readonly type_not_starts_with?: Scalars['String'] | null;
  readonly type_ends_with?: Scalars['String'] | null;
  readonly type_not_ends_with?: Scalars['String'] | null;
  readonly type_i?: Scalars['String'] | null;
  readonly type_not_i?: Scalars['String'] | null;
  readonly type_contains_i?: Scalars['String'] | null;
  readonly type_not_contains_i?: Scalars['String'] | null;
  readonly type_starts_with_i?: Scalars['String'] | null;
  readonly type_not_starts_with_i?: Scalars['String'] | null;
  readonly type_ends_with_i?: Scalars['String'] | null;
  readonly type_not_ends_with_i?: Scalars['String'] | null;
  readonly type_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly type_not_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly value?: Scalars['String'] | null;
  readonly value_not?: Scalars['String'] | null;
  readonly value_contains?: Scalars['String'] | null;
  readonly value_not_contains?: Scalars['String'] | null;
  readonly value_starts_with?: Scalars['String'] | null;
  readonly value_not_starts_with?: Scalars['String'] | null;
  readonly value_ends_with?: Scalars['String'] | null;
  readonly value_not_ends_with?: Scalars['String'] | null;
  readonly value_i?: Scalars['String'] | null;
  readonly value_not_i?: Scalars['String'] | null;
  readonly value_contains_i?: Scalars['String'] | null;
  readonly value_not_contains_i?: Scalars['String'] | null;
  readonly value_starts_with_i?: Scalars['String'] | null;
  readonly value_not_starts_with_i?: Scalars['String'] | null;
  readonly value_ends_with_i?: Scalars['String'] | null;
  readonly value_not_ends_with_i?: Scalars['String'] | null;
  readonly value_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly value_not_in?: ReadonlyArray<Scalars['String'] | null> | null;
};

export type PhoneNumberWhereUniqueInput = {
  readonly id: Scalars['ID'];
};

export type SortPhoneNumbersBy =
  | 'id_ASC'
  | 'id_DESC'
  | 'user_ASC'
  | 'user_DESC'
  | 'type_ASC'
  | 'type_DESC'
  | 'value_ASC'
  | 'value_DESC';

export type PhoneNumberUpdateInput = {
  readonly user?: UserRelateToOneInput | null;
  readonly type?: Scalars['String'] | null;
  readonly value?: Scalars['String'] | null;
};

export type PhoneNumbersUpdateInput = {
  readonly id: Scalars['ID'];
  readonly data?: PhoneNumberUpdateInput | null;
};

export type PhoneNumberCreateInput = {
  readonly user?: UserRelateToOneInput | null;
  readonly type?: Scalars['String'] | null;
  readonly value?: Scalars['String'] | null;
};

export type PhoneNumbersCreateInput = {
  readonly data?: PhoneNumberCreateInput | null;
};

export type PostWhereInput = {
  readonly AND?: ReadonlyArray<PostWhereInput | null> | null;
  readonly OR?: ReadonlyArray<PostWhereInput | null> | null;
  readonly id?: Scalars['ID'] | null;
  readonly id_not?: Scalars['ID'] | null;
  readonly id_in?: ReadonlyArray<Scalars['ID'] | null> | null;
  readonly id_not_in?: ReadonlyArray<Scalars['ID'] | null> | null;
  readonly title?: Scalars['String'] | null;
  readonly title_not?: Scalars['String'] | null;
  readonly title_contains?: Scalars['String'] | null;
  readonly title_not_contains?: Scalars['String'] | null;
  readonly title_starts_with?: Scalars['String'] | null;
  readonly title_not_starts_with?: Scalars['String'] | null;
  readonly title_ends_with?: Scalars['String'] | null;
  readonly title_not_ends_with?: Scalars['String'] | null;
  readonly title_i?: Scalars['String'] | null;
  readonly title_not_i?: Scalars['String'] | null;
  readonly title_contains_i?: Scalars['String'] | null;
  readonly title_not_contains_i?: Scalars['String'] | null;
  readonly title_starts_with_i?: Scalars['String'] | null;
  readonly title_not_starts_with_i?: Scalars['String'] | null;
  readonly title_ends_with_i?: Scalars['String'] | null;
  readonly title_not_ends_with_i?: Scalars['String'] | null;
  readonly title_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly title_not_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly status?: Scalars['String'] | null;
  readonly status_not?: Scalars['String'] | null;
  readonly status_contains?: Scalars['String'] | null;
  readonly status_not_contains?: Scalars['String'] | null;
  readonly status_starts_with?: Scalars['String'] | null;
  readonly status_not_starts_with?: Scalars['String'] | null;
  readonly status_ends_with?: Scalars['String'] | null;
  readonly status_not_ends_with?: Scalars['String'] | null;
  readonly status_i?: Scalars['String'] | null;
  readonly status_not_i?: Scalars['String'] | null;
  readonly status_contains_i?: Scalars['String'] | null;
  readonly status_not_contains_i?: Scalars['String'] | null;
  readonly status_starts_with_i?: Scalars['String'] | null;
  readonly status_not_starts_with_i?: Scalars['String'] | null;
  readonly status_ends_with_i?: Scalars['String'] | null;
  readonly status_not_ends_with_i?: Scalars['String'] | null;
  readonly status_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly status_not_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly publishDate?: Scalars['String'] | null;
  readonly publishDate_not?: Scalars['String'] | null;
  readonly publishDate_lt?: Scalars['String'] | null;
  readonly publishDate_lte?: Scalars['String'] | null;
  readonly publishDate_gt?: Scalars['String'] | null;
  readonly publishDate_gte?: Scalars['String'] | null;
  readonly publishDate_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly publishDate_not_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly author?: UserWhereInput | null;
  readonly author_is_null?: Scalars['Boolean'] | null;
};

export type PostWhereUniqueInput = {
  readonly id: Scalars['ID'];
};

export type SortPostsBy =
  | 'id_ASC'
  | 'id_DESC'
  | 'title_ASC'
  | 'title_DESC'
  | 'status_ASC'
  | 'status_DESC'
  | 'publishDate_ASC'
  | 'publishDate_DESC'
  | 'author_ASC'
  | 'author_DESC';

export type PostUpdateInput = {
  readonly title?: Scalars['String'] | null;
  readonly status?: Scalars['String'] | null;
  readonly content?: Scalars['JSON'] | null;
  readonly publishDate?: Scalars['String'] | null;
  readonly author?: UserRelateToOneInput | null;
};

export type PostsUpdateInput = {
  readonly id: Scalars['ID'];
  readonly data?: PostUpdateInput | null;
};

export type PostCreateInput = {
  readonly title?: Scalars['String'] | null;
  readonly status?: Scalars['String'] | null;
  readonly content?: Scalars['JSON'] | null;
  readonly publishDate?: Scalars['String'] | null;
  readonly author?: UserRelateToOneInput | null;
};

export type PostsCreateInput = {
  readonly data?: PostCreateInput | null;
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

export type UserListTypeInfo = {
  key: 'User';
  fields:
    | 'id'
    | 'name'
    | 'email'
    | 'password'
    | 'isAdmin'
    | 'roles'
    | 'phoneNumbers'
    | 'posts'
    | 'randomNumber';
  backing: {
    readonly id: string;
    readonly name?: string | null;
    readonly email?: string | null;
    readonly password?: string | null;
    readonly isAdmin?: boolean | null;
    readonly roles?: string | null;
    readonly phoneNumbers?: string | null;
    readonly posts?: string | null;
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

export type PhoneNumberListTypeInfo = {
  key: 'PhoneNumber';
  fields: 'id' | 'label' | 'user' | 'type' | 'value';
  backing: {
    readonly id: string;
    readonly user?: string | null;
    readonly type?: string | null;
    readonly value?: string | null;
  };
  inputs: {
    where: PhoneNumberWhereInput;
    create: PhoneNumberCreateInput;
    update: PhoneNumberUpdateInput;
  };
  args: {
    listQuery: {
      readonly where?: PhoneNumberWhereInput | null;
      readonly sortBy?: ReadonlyArray<SortPhoneNumbersBy> | null;
      readonly first?: Scalars['Int'] | null;
      readonly skip?: Scalars['Int'] | null;
    };
  };
};

export type PhoneNumberListFn = (
  listConfig: import('@keystone-next/keystone/schema').ListConfig<
    PhoneNumberListTypeInfo,
    PhoneNumberListTypeInfo['fields']
  >
) => import('@keystone-next/keystone/schema').ListConfig<
  PhoneNumberListTypeInfo,
  PhoneNumberListTypeInfo['fields']
>;

export type PostListTypeInfo = {
  key: 'Post';
  fields: 'id' | 'title' | 'status' | 'content' | 'publishDate' | 'author';
  backing: {
    readonly id: string;
    readonly title?: string | null;
    readonly status?: string | null;
    readonly content?: Record<string, any>[] | null;
    readonly publishDate?: Date | null;
    readonly author?: string | null;
  };
  inputs: {
    where: PostWhereInput;
    create: PostCreateInput;
    update: PostUpdateInput;
  };
  args: {
    listQuery: {
      readonly where?: PostWhereInput | null;
      readonly sortBy?: ReadonlyArray<SortPostsBy> | null;
      readonly first?: Scalars['Int'] | null;
      readonly skip?: Scalars['Int'] | null;
    };
  };
};

export type PostListFn = (
  listConfig: import('@keystone-next/keystone/schema').ListConfig<
    PostListTypeInfo,
    PostListTypeInfo['fields']
  >
) => import('@keystone-next/keystone/schema').ListConfig<
  PostListTypeInfo,
  PostListTypeInfo['fields']
>;

export type KeystoneListsTypeInfo = {
  readonly User: UserListTypeInfo;
  readonly PhoneNumber: PhoneNumberListTypeInfo;
  readonly Post: PostListTypeInfo;
};
