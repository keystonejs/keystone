/* eslint-disable */

type Scalars = {
  readonly ID: string;
  readonly Boolean: boolean;
  readonly String: string;
  readonly Int: number;
  readonly Float: number;
  readonly JSON: import('@keystone-6/core/types').JSONValue;
  readonly Decimal: import('@keystone-6/core/types').Decimal | string;
};

export type PostStatusType =
  | 'draft'
  | 'published';

export type PostWhereUniqueInput = {
  readonly id?: Scalars['ID'] | null;
};

export type PostWhereInput = {
  readonly AND?: ReadonlyArray<PostWhereInput> | PostWhereInput | null;
  readonly OR?: ReadonlyArray<PostWhereInput> | PostWhereInput | null;
  readonly NOT?: ReadonlyArray<PostWhereInput> | PostWhereInput | null;
  readonly id?: IDFilter | null;
  readonly title?: StringFilter | null;
  readonly status?: PostStatusTypeNullableFilter | null;
  readonly content?: StringFilter | null;
  readonly publishDate?: DateTimeNullableFilter | null;
  readonly author?: AuthorWhereInput | null;
};

export type IDFilter = {
  readonly equals?: Scalars['ID'] | null;
  readonly in?: ReadonlyArray<Scalars['ID']> | Scalars['ID'] | null;
  readonly notIn?: ReadonlyArray<Scalars['ID']> | Scalars['ID'] | null;
  readonly lt?: Scalars['ID'] | null;
  readonly lte?: Scalars['ID'] | null;
  readonly gt?: Scalars['ID'] | null;
  readonly gte?: Scalars['ID'] | null;
  readonly not?: IDFilter | null;
};

export type StringFilter = {
  readonly equals?: Scalars['String'] | null;
  readonly in?: ReadonlyArray<Scalars['String']> | Scalars['String'] | null;
  readonly notIn?: ReadonlyArray<Scalars['String']> | Scalars['String'] | null;
  readonly lt?: Scalars['String'] | null;
  readonly lte?: Scalars['String'] | null;
  readonly gt?: Scalars['String'] | null;
  readonly gte?: Scalars['String'] | null;
  readonly contains?: Scalars['String'] | null;
  readonly startsWith?: Scalars['String'] | null;
  readonly endsWith?: Scalars['String'] | null;
  readonly not?: NestedStringFilter | null;
};

export type NestedStringFilter = {
  readonly equals?: Scalars['String'] | null;
  readonly in?: ReadonlyArray<Scalars['String']> | Scalars['String'] | null;
  readonly notIn?: ReadonlyArray<Scalars['String']> | Scalars['String'] | null;
  readonly lt?: Scalars['String'] | null;
  readonly lte?: Scalars['String'] | null;
  readonly gt?: Scalars['String'] | null;
  readonly gte?: Scalars['String'] | null;
  readonly contains?: Scalars['String'] | null;
  readonly startsWith?: Scalars['String'] | null;
  readonly endsWith?: Scalars['String'] | null;
  readonly not?: NestedStringFilter | null;
};

export type PostStatusTypeNullableFilter = {
  readonly equals?: PostStatusType | null;
  readonly in?: ReadonlyArray<PostStatusType> | PostStatusType | null;
  readonly notIn?: ReadonlyArray<PostStatusType> | PostStatusType | null;
  readonly not?: PostStatusTypeNullableFilter | null;
};

export type DateTimeNullableFilter = {
  readonly equals?: any | null;
  readonly in?: ReadonlyArray<any> | any | null;
  readonly notIn?: ReadonlyArray<any> | any | null;
  readonly lt?: any | null;
  readonly lte?: any | null;
  readonly gt?: any | null;
  readonly gte?: any | null;
  readonly not?: DateTimeNullableFilter | null;
};

export type PostOrderByInput = {
  readonly id?: OrderDirection | null;
  readonly title?: OrderDirection | null;
  readonly status?: OrderDirection | null;
  readonly content?: OrderDirection | null;
  readonly publishDate?: OrderDirection | null;
};

export type OrderDirection =
  | 'asc'
  | 'desc';

export type PostUpdateInput = {
  readonly title?: Scalars['String'] | null;
  readonly status?: PostStatusType | null;
  readonly content?: Scalars['String'] | null;
  readonly publishDate?: any | null;
  readonly author?: AuthorRelateToOneForUpdateInput | null;
};

export type AuthorRelateToOneForUpdateInput = {
  readonly create?: AuthorCreateInput | null;
  readonly connect?: AuthorWhereUniqueInput | null;
  readonly disconnect?: Scalars['Boolean'] | null;
};

export type PostUpdateArgs = {
  readonly where: PostWhereUniqueInput;
  readonly data: PostUpdateInput;
};

export type PostCreateInput = {
  readonly title?: Scalars['String'] | null;
  readonly status?: PostStatusType | null;
  readonly content?: Scalars['String'] | null;
  readonly publishDate?: any | null;
  readonly author?: AuthorRelateToOneForCreateInput | null;
};

export type AuthorRelateToOneForCreateInput = {
  readonly create?: AuthorCreateInput | null;
  readonly connect?: AuthorWhereUniqueInput | null;
};

export type AuthorWhereUniqueInput = {
  readonly id?: Scalars['ID'] | null;
};

export type AuthorWhereInput = {
  readonly AND?: ReadonlyArray<AuthorWhereInput> | AuthorWhereInput | null;
  readonly OR?: ReadonlyArray<AuthorWhereInput> | AuthorWhereInput | null;
  readonly NOT?: ReadonlyArray<AuthorWhereInput> | AuthorWhereInput | null;
  readonly id?: IDFilter | null;
  readonly name?: StringFilter | null;
  readonly posts?: PostManyRelationFilter | null;
};

export type PostManyRelationFilter = {
  readonly every?: PostWhereInput | null;
  readonly some?: PostWhereInput | null;
  readonly none?: PostWhereInput | null;
};

export type AuthorOrderByInput = {
  readonly id?: OrderDirection | null;
  readonly name?: OrderDirection | null;
};

export type AuthorUpdateInput = {
  readonly name?: Scalars['String'] | null;
  readonly posts?: PostRelateToManyForUpdateInput | null;
};

export type PostRelateToManyForUpdateInput = {
  readonly disconnect?: ReadonlyArray<PostWhereUniqueInput> | PostWhereUniqueInput | null;
  readonly set?: ReadonlyArray<PostWhereUniqueInput> | PostWhereUniqueInput | null;
  readonly create?: ReadonlyArray<PostCreateInput> | PostCreateInput | null;
  readonly connect?: ReadonlyArray<PostWhereUniqueInput> | PostWhereUniqueInput | null;
};

export type AuthorUpdateArgs = {
  readonly where: AuthorWhereUniqueInput;
  readonly data: AuthorUpdateInput;
};

export type AuthorCreateInput = {
  readonly name?: Scalars['String'] | null;
  readonly posts?: PostRelateToManyForCreateInput | null;
};

export type PostRelateToManyForCreateInput = {
  readonly create?: ReadonlyArray<PostCreateInput> | PostCreateInput | null;
  readonly connect?: ReadonlyArray<PostWhereUniqueInput> | PostWhereUniqueInput | null;
};

export type KeystoneAdminUIFieldMetaIsNonNull =
  | 'read'
  | 'create'
  | 'update';

export type KeystoneAdminUIFieldMetaCreateViewFieldMode =
  | 'edit'
  | 'hidden';

export type KeystoneAdminUIFieldMetaListViewFieldMode =
  | 'read'
  | 'hidden';

export type KeystoneAdminUIFieldMetaItemViewFieldMode =
  | 'edit'
  | 'read'
  | 'hidden';

export type KeystoneAdminUIFieldMetaItemViewFieldPosition =
  | 'form'
  | 'sidebar';

export type QueryMode =
  | 'default'
  | 'insensitive';

export type KeystoneAdminUISortDirection =
  | 'ASC'
  | 'DESC';

type ResolvedPostCreateInput = {
  id?: import('./node_modules/.myprisma/client').Prisma.PostCreateInput['id'];
  title?: import('./node_modules/.myprisma/client').Prisma.PostCreateInput['title'];
  status?: import('./node_modules/.myprisma/client').Prisma.PostCreateInput['status'];
  content?: import('./node_modules/.myprisma/client').Prisma.PostCreateInput['content'];
  publishDate?: import('./node_modules/.myprisma/client').Prisma.PostCreateInput['publishDate'];
  author?: import('./node_modules/.myprisma/client').Prisma.PostCreateInput['author'];
};

type ResolvedPostUpdateInput = {
  id?: undefined;
  title?: import('./node_modules/.myprisma/client').Prisma.PostUpdateInput['title'];
  status?: import('./node_modules/.myprisma/client').Prisma.PostUpdateInput['status'];
  content?: import('./node_modules/.myprisma/client').Prisma.PostUpdateInput['content'];
  publishDate?: import('./node_modules/.myprisma/client').Prisma.PostUpdateInput['publishDate'];
  author?: import('./node_modules/.myprisma/client').Prisma.PostUpdateInput['author'];
};

type ResolvedAuthorCreateInput = {
  id?: import('./node_modules/.myprisma/client').Prisma.AuthorCreateInput['id'];
  name?: import('./node_modules/.myprisma/client').Prisma.AuthorCreateInput['name'];
  posts?: import('./node_modules/.myprisma/client').Prisma.AuthorCreateInput['posts'];
};

type ResolvedAuthorUpdateInput = {
  id?: undefined;
  name?: import('./node_modules/.myprisma/client').Prisma.AuthorUpdateInput['name'];
  posts?: import('./node_modules/.myprisma/client').Prisma.AuthorUpdateInput['posts'];
};

export declare namespace Lists {
  export type Post<Session = any> = import('@keystone-6/core').ListConfig<Lists.Post.TypeInfo<Session>, any>;
  namespace Post {
    export type Item = import('./node_modules/.myprisma/client').Post;
    export type TypeInfo<Session = any> = {
      key: 'Post';
      isSingleton: false;
      fields: 'id' | 'title' | 'status' | 'content' | 'publishDate' | 'author'
      item: Item;
      inputs: {
        where: PostWhereInput;
        uniqueWhere: PostWhereUniqueInput;
        create: PostCreateInput;
        update: PostUpdateInput;
        orderBy: PostOrderByInput;
      };
      prisma: {
        create: ResolvedPostCreateInput;
        update: ResolvedPostUpdateInput;
      };
      all: __TypeInfo<Session>;
    };
  }
  export type Author<Session = any> = import('@keystone-6/core').ListConfig<Lists.Author.TypeInfo<Session>, any>;
  namespace Author {
    export type Item = import('./node_modules/.myprisma/client').Author;
    export type TypeInfo<Session = any> = {
      key: 'Author';
      isSingleton: false;
      fields: 'id' | 'name' | 'posts'
      item: Item;
      inputs: {
        where: AuthorWhereInput;
        uniqueWhere: AuthorWhereUniqueInput;
        create: AuthorCreateInput;
        update: AuthorUpdateInput;
        orderBy: AuthorOrderByInput;
      };
      prisma: {
        create: ResolvedAuthorCreateInput;
        update: ResolvedAuthorUpdateInput;
      };
      all: __TypeInfo<Session>;
    };
  }
}
export type Context<Session = any> = import('@keystone-6/core/types').KeystoneContext<TypeInfo<Session>>;
export type Config<Session = any> = import('@keystone-6/core/types').KeystoneConfig<TypeInfo<Session>>;

export type TypeInfo<Session = any> = {
  lists: {
    readonly Post: Lists.Post.TypeInfo;
    readonly Author: Lists.Author.TypeInfo;
  };
  prisma: import('./node_modules/.myprisma/client').PrismaClient;
  session: Session;
};

type __TypeInfo<Session = any> = TypeInfo<Session>;

export type Lists<Session = any> = {
  [Key in keyof TypeInfo['lists']]?: import('@keystone-6/core').ListConfig<TypeInfo<Session>['lists'][Key], any>
} & Record<string, import('@keystone-6/core').ListConfig<any, any>>;

export {}
