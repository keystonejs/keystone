type Scalars = {
  readonly ID: string;
  readonly Boolean: boolean;
  readonly String: string;
  readonly Int: number;
  readonly Float: number;
  readonly JSON: import('@keystone-next/types').JSONValue;
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
  readonly posts_every?: PostWhereInput | null;
  readonly posts_some?: PostWhereInput | null;
  readonly posts_none?: PostWhereInput | null;
  readonly something?: Scalars['String'] | null;
  readonly something_not?: Scalars['String'] | null;
  readonly something_contains?: Scalars['String'] | null;
  readonly something_not_contains?: Scalars['String'] | null;
  readonly something_starts_with?: Scalars['String'] | null;
  readonly something_not_starts_with?: Scalars['String'] | null;
  readonly something_ends_with?: Scalars['String'] | null;
  readonly something_not_ends_with?: Scalars['String'] | null;
  readonly something_i?: Scalars['String'] | null;
  readonly something_not_i?: Scalars['String'] | null;
  readonly something_contains_i?: Scalars['String'] | null;
  readonly something_not_contains_i?: Scalars['String'] | null;
  readonly something_starts_with_i?: Scalars['String'] | null;
  readonly something_not_starts_with_i?: Scalars['String'] | null;
  readonly something_ends_with_i?: Scalars['String'] | null;
  readonly something_not_ends_with_i?: Scalars['String'] | null;
  readonly something_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly something_not_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly oneTimeThing?: Scalars['String'] | null;
  readonly oneTimeThing_not?: Scalars['String'] | null;
  readonly oneTimeThing_contains?: Scalars['String'] | null;
  readonly oneTimeThing_not_contains?: Scalars['String'] | null;
  readonly oneTimeThing_starts_with?: Scalars['String'] | null;
  readonly oneTimeThing_not_starts_with?: Scalars['String'] | null;
  readonly oneTimeThing_ends_with?: Scalars['String'] | null;
  readonly oneTimeThing_not_ends_with?: Scalars['String'] | null;
  readonly oneTimeThing_i?: Scalars['String'] | null;
  readonly oneTimeThing_not_i?: Scalars['String'] | null;
  readonly oneTimeThing_contains_i?: Scalars['String'] | null;
  readonly oneTimeThing_not_contains_i?: Scalars['String'] | null;
  readonly oneTimeThing_starts_with_i?: Scalars['String'] | null;
  readonly oneTimeThing_not_starts_with_i?: Scalars['String'] | null;
  readonly oneTimeThing_ends_with_i?: Scalars['String'] | null;
  readonly oneTimeThing_not_ends_with_i?: Scalars['String'] | null;
  readonly oneTimeThing_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly oneTimeThing_not_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly passwordResetToken_is_set?: Scalars['Boolean'] | null;
  readonly passwordResetIssuedAt?: Scalars['String'] | null;
  readonly passwordResetIssuedAt_not?: Scalars['String'] | null;
  readonly passwordResetIssuedAt_lt?: Scalars['String'] | null;
  readonly passwordResetIssuedAt_lte?: Scalars['String'] | null;
  readonly passwordResetIssuedAt_gt?: Scalars['String'] | null;
  readonly passwordResetIssuedAt_gte?: Scalars['String'] | null;
  readonly passwordResetIssuedAt_in?: ReadonlyArray<
    Scalars['String'] | null
  > | null;
  readonly passwordResetIssuedAt_not_in?: ReadonlyArray<
    Scalars['String'] | null
  > | null;
  readonly passwordResetRedeemedAt?: Scalars['String'] | null;
  readonly passwordResetRedeemedAt_not?: Scalars['String'] | null;
  readonly passwordResetRedeemedAt_lt?: Scalars['String'] | null;
  readonly passwordResetRedeemedAt_lte?: Scalars['String'] | null;
  readonly passwordResetRedeemedAt_gt?: Scalars['String'] | null;
  readonly passwordResetRedeemedAt_gte?: Scalars['String'] | null;
  readonly passwordResetRedeemedAt_in?: ReadonlyArray<
    Scalars['String'] | null
  > | null;
  readonly passwordResetRedeemedAt_not_in?: ReadonlyArray<
    Scalars['String'] | null
  > | null;
  readonly magicAuthToken_is_set?: Scalars['Boolean'] | null;
  readonly magicAuthIssuedAt?: Scalars['String'] | null;
  readonly magicAuthIssuedAt_not?: Scalars['String'] | null;
  readonly magicAuthIssuedAt_lt?: Scalars['String'] | null;
  readonly magicAuthIssuedAt_lte?: Scalars['String'] | null;
  readonly magicAuthIssuedAt_gt?: Scalars['String'] | null;
  readonly magicAuthIssuedAt_gte?: Scalars['String'] | null;
  readonly magicAuthIssuedAt_in?: ReadonlyArray<
    Scalars['String'] | null
  > | null;
  readonly magicAuthIssuedAt_not_in?: ReadonlyArray<
    Scalars['String'] | null
  > | null;
  readonly magicAuthRedeemedAt?: Scalars['String'] | null;
  readonly magicAuthRedeemedAt_not?: Scalars['String'] | null;
  readonly magicAuthRedeemedAt_lt?: Scalars['String'] | null;
  readonly magicAuthRedeemedAt_lte?: Scalars['String'] | null;
  readonly magicAuthRedeemedAt_gt?: Scalars['String'] | null;
  readonly magicAuthRedeemedAt_gte?: Scalars['String'] | null;
  readonly magicAuthRedeemedAt_in?: ReadonlyArray<
    Scalars['String'] | null
  > | null;
  readonly magicAuthRedeemedAt_not_in?: ReadonlyArray<
    Scalars['String'] | null
  > | null;
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
  | 'posts_ASC'
  | 'posts_DESC'
  | 'something_ASC'
  | 'something_DESC'
  | 'oneTimeThing_ASC'
  | 'oneTimeThing_DESC'
  | 'passwordResetIssuedAt_ASC'
  | 'passwordResetIssuedAt_DESC'
  | 'passwordResetRedeemedAt_ASC'
  | 'passwordResetRedeemedAt_DESC'
  | 'magicAuthIssuedAt_ASC'
  | 'magicAuthIssuedAt_DESC'
  | 'magicAuthRedeemedAt_ASC'
  | 'magicAuthRedeemedAt_DESC';

export type UserUpdateInput = {
  readonly name?: Scalars['String'] | null;
  readonly email?: Scalars['String'] | null;
  readonly password?: Scalars['String'] | null;
  readonly isAdmin?: Scalars['Boolean'] | null;
  readonly roles?: Scalars['String'] | null;
  readonly posts?: PostRelateToManyInput | null;
  readonly something?: Scalars['String'] | null;
  readonly passwordResetToken?: Scalars['String'] | null;
  readonly passwordResetIssuedAt?: Scalars['String'] | null;
  readonly passwordResetRedeemedAt?: Scalars['String'] | null;
  readonly magicAuthToken?: Scalars['String'] | null;
  readonly magicAuthIssuedAt?: Scalars['String'] | null;
  readonly magicAuthRedeemedAt?: Scalars['String'] | null;
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
  readonly posts?: PostRelateToManyInput | null;
  readonly something?: Scalars['String'] | null;
  readonly oneTimeThing?: Scalars['String'] | null;
  readonly passwordResetToken?: Scalars['String'] | null;
  readonly passwordResetIssuedAt?: Scalars['String'] | null;
  readonly passwordResetRedeemedAt?: Scalars['String'] | null;
  readonly magicAuthToken?: Scalars['String'] | null;
  readonly magicAuthIssuedAt?: Scalars['String'] | null;
  readonly magicAuthRedeemedAt?: Scalars['String'] | null;
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
  readonly views?: Scalars['Int'] | null;
  readonly views_not?: Scalars['Int'] | null;
  readonly views_lt?: Scalars['Int'] | null;
  readonly views_lte?: Scalars['Int'] | null;
  readonly views_gt?: Scalars['Int'] | null;
  readonly views_gte?: Scalars['Int'] | null;
  readonly views_in?: ReadonlyArray<Scalars['Int'] | null> | null;
  readonly views_not_in?: ReadonlyArray<Scalars['Int'] | null> | null;
  readonly content?: Scalars['String'] | null;
  readonly content_not?: Scalars['String'] | null;
  readonly content_contains?: Scalars['String'] | null;
  readonly content_not_contains?: Scalars['String'] | null;
  readonly content_starts_with?: Scalars['String'] | null;
  readonly content_not_starts_with?: Scalars['String'] | null;
  readonly content_ends_with?: Scalars['String'] | null;
  readonly content_not_ends_with?: Scalars['String'] | null;
  readonly content_i?: Scalars['String'] | null;
  readonly content_not_i?: Scalars['String'] | null;
  readonly content_contains_i?: Scalars['String'] | null;
  readonly content_not_contains_i?: Scalars['String'] | null;
  readonly content_starts_with_i?: Scalars['String'] | null;
  readonly content_not_starts_with_i?: Scalars['String'] | null;
  readonly content_ends_with_i?: Scalars['String'] | null;
  readonly content_not_ends_with_i?: Scalars['String'] | null;
  readonly content_in?: ReadonlyArray<Scalars['String'] | null> | null;
  readonly content_not_in?: ReadonlyArray<Scalars['String'] | null> | null;
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
  | 'views_ASC'
  | 'views_DESC'
  | 'content_ASC'
  | 'content_DESC'
  | 'status_ASC'
  | 'status_DESC'
  | 'publishDate_ASC'
  | 'publishDate_DESC'
  | 'author_ASC'
  | 'author_DESC';

export type PostUpdateInput = {
  readonly title?: Scalars['String'] | null;
  readonly views?: Scalars['Int'] | null;
  readonly content?: Scalars['String'] | null;
  readonly status?: Scalars['String'] | null;
  readonly publishDate?: Scalars['String'] | null;
  readonly author?: UserRelateToOneInput | null;
};

export type PostsUpdateInput = {
  readonly id: Scalars['ID'];
  readonly data?: PostUpdateInput | null;
};

export type PostCreateInput = {
  readonly title?: Scalars['String'] | null;
  readonly views?: Scalars['Int'] | null;
  readonly content?: Scalars['String'] | null;
  readonly status?: Scalars['String'] | null;
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

export type CacheControlScope = 'PUBLIC' | 'PRIVATE';

export type AuthErrorCode =
  | 'PASSWORD_AUTH_FAILURE'
  | 'PASSWORD_AUTH_IDENTITY_NOT_FOUND'
  | 'PASSWORD_AUTH_SECRET_NOT_SET'
  | 'PASSWORD_AUTH_MULTIPLE_IDENTITY_MATCHES'
  | 'PASSWORD_AUTH_SECRET_MISMATCH'
  | 'AUTH_TOKEN_REQUEST_IDENTITY_NOT_FOUND'
  | 'AUTH_TOKEN_REQUEST_MULTIPLE_IDENTITY_MATCHES'
  | 'AUTH_TOKEN_REDEMPTION_FAILURE'
  | 'AUTH_TOKEN_REDEMPTION_IDENTITY_NOT_FOUND'
  | 'AUTH_TOKEN_REDEMPTION_MULTIPLE_IDENTITY_MATCHES'
  | 'AUTH_TOKEN_REDEMPTION_TOKEN_NOT_SET'
  | 'AUTH_TOKEN_REDEMPTION_TOKEN_MISMATCH'
  | 'AUTH_TOKEN_REDEMPTION_TOKEN_EXPIRED'
  | 'AUTH_TOKEN_REDEMPTION_TOKEN_REDEEMED';

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
    | 'randomNumber'
    | 'email'
    | 'password'
    | 'isAdmin'
    | 'roles'
    | 'posts'
    | 'something'
    | 'oneTimeThing'
    | 'passwordResetToken'
    | 'passwordResetIssuedAt'
    | 'passwordResetRedeemedAt'
    | 'magicAuthToken'
    | 'magicAuthIssuedAt'
    | 'magicAuthRedeemedAt';
  backing: {
    readonly id: string;
    readonly name?: string | null;
    readonly email?: string | null;
    readonly password?: string | null;
    readonly isAdmin?: boolean | null;
    readonly roles?: string | null;
    readonly posts?: string | null;
    readonly something?: string | null;
    readonly oneTimeThing?: string | null;
    readonly passwordResetToken?: string | null;
    readonly passwordResetIssuedAt?: Date | null;
    readonly passwordResetRedeemedAt?: Date | null;
    readonly magicAuthToken?: string | null;
    readonly magicAuthIssuedAt?: Date | null;
    readonly magicAuthRedeemedAt?: Date | null;
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

export type PostListTypeInfo = {
  key: 'Post';
  fields:
    | 'id'
    | 'title'
    | 'views'
    | 'content'
    | 'status'
    | 'publishDate'
    | 'author';
  backing: {
    readonly id: string;
    readonly title?: string | null;
    readonly views?: number | null;
    readonly content?: string | null;
    readonly status?: string | null;
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
  readonly Post: PostListTypeInfo;
};
