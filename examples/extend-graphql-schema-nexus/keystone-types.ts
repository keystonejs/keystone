/* eslint-disable */

export type PostStatusType =
  | 'draft'
  | 'published'

export type PostWhereUniqueInput = {
  readonly id?: string | null
}

export type PostWhereInput = {
  readonly AND?: ReadonlyArray<PostWhereInput> | PostWhereInput | null
  readonly OR?: ReadonlyArray<PostWhereInput> | PostWhereInput | null
  readonly NOT?: ReadonlyArray<PostWhereInput> | PostWhereInput | null
  readonly id?: IDFilter | null
  readonly title?: StringFilter | null
  readonly status?: PostStatusTypeNullableFilter | null
  readonly content?: StringFilter | null
  readonly publishDate?: DateTimeNullableFilter | null
  readonly author?: AuthorWhereInput | null
}

export type IDFilter = {
  readonly equals?: string | null
  readonly in?: ReadonlyArray<string> | string | null
  readonly notIn?: ReadonlyArray<string> | string | null
  readonly lt?: string | null
  readonly lte?: string | null
  readonly gt?: string | null
  readonly gte?: string | null
  readonly not?: IDFilter | null
}

export type StringFilter = {
  readonly equals?: string | null
  readonly in?: ReadonlyArray<string> | string | null
  readonly notIn?: ReadonlyArray<string> | string | null
  readonly lt?: string | null
  readonly lte?: string | null
  readonly gt?: string | null
  readonly gte?: string | null
  readonly contains?: string | null
  readonly startsWith?: string | null
  readonly endsWith?: string | null
  readonly not?: NestedStringFilter | null
}

export type NestedStringFilter = {
  readonly equals?: string | null
  readonly in?: ReadonlyArray<string> | string | null
  readonly notIn?: ReadonlyArray<string> | string | null
  readonly lt?: string | null
  readonly lte?: string | null
  readonly gt?: string | null
  readonly gte?: string | null
  readonly contains?: string | null
  readonly startsWith?: string | null
  readonly endsWith?: string | null
  readonly not?: NestedStringFilter | null
}

export type PostStatusTypeNullableFilter = {
  readonly equals?: PostStatusType | null
  readonly in?: ReadonlyArray<PostStatusType> | PostStatusType | null
  readonly notIn?: ReadonlyArray<PostStatusType> | PostStatusType | null
  readonly not?: PostStatusTypeNullableFilter | null
}

export type DateTimeNullableFilter = {
  readonly equals?: any | null
  readonly in?: ReadonlyArray<any> | any | null
  readonly notIn?: ReadonlyArray<any> | any | null
  readonly lt?: any | null
  readonly lte?: any | null
  readonly gt?: any | null
  readonly gte?: any | null
  readonly not?: DateTimeNullableFilter | null
}

export type PostOrderByInput = {
  readonly id?: OrderDirection | null
  readonly title?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly content?: OrderDirection | null
  readonly publishDate?: OrderDirection | null
}

export type OrderDirection =
  | 'asc'
  | 'desc'

export type PostUpdateInput = {
  readonly title?: string | null
  readonly status?: PostStatusType | null
  readonly content?: string | null
  readonly publishDate?: any | null
  readonly author?: AuthorRelateToOneForUpdateInput | null
}

export type AuthorRelateToOneForUpdateInput = {
  readonly create?: AuthorCreateInput | null
  readonly connect?: AuthorWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type PostUpdateArgs = {
  readonly where: PostWhereUniqueInput
  readonly data: PostUpdateInput
}

export type PostCreateInput = {
  readonly title?: string | null
  readonly status?: PostStatusType | null
  readonly content?: string | null
  readonly publishDate?: any | null
  readonly author?: AuthorRelateToOneForCreateInput | null
}

export type AuthorRelateToOneForCreateInput = {
  readonly create?: AuthorCreateInput | null
  readonly connect?: AuthorWhereUniqueInput | null
}

export type AuthorWhereUniqueInput = {
  readonly id?: string | null
}

export type AuthorWhereInput = {
  readonly AND?: ReadonlyArray<AuthorWhereInput> | AuthorWhereInput | null
  readonly OR?: ReadonlyArray<AuthorWhereInput> | AuthorWhereInput | null
  readonly NOT?: ReadonlyArray<AuthorWhereInput> | AuthorWhereInput | null
  readonly id?: IDFilter | null
  readonly name?: StringFilter | null
  readonly posts?: PostManyRelationFilter | null
}

export type PostManyRelationFilter = {
  readonly every?: PostWhereInput | null
  readonly some?: PostWhereInput | null
  readonly none?: PostWhereInput | null
}

export type AuthorOrderByInput = {
  readonly id?: OrderDirection | null
  readonly name?: OrderDirection | null
}

export type AuthorUpdateInput = {
  readonly name?: string | null
  readonly posts?: PostRelateToManyForUpdateInput | null
}

export type PostRelateToManyForUpdateInput = {
  readonly disconnect?: ReadonlyArray<PostWhereUniqueInput> | PostWhereUniqueInput | null
  readonly set?: ReadonlyArray<PostWhereUniqueInput> | PostWhereUniqueInput | null
  readonly create?: ReadonlyArray<PostCreateInput> | PostCreateInput | null
  readonly connect?: ReadonlyArray<PostWhereUniqueInput> | PostWhereUniqueInput | null
}

export type AuthorUpdateArgs = {
  readonly where: AuthorWhereUniqueInput
  readonly data: AuthorUpdateInput
}

export type AuthorCreateInput = {
  readonly name?: string | null
  readonly posts?: PostRelateToManyForCreateInput | null
}

export type PostRelateToManyForCreateInput = {
  readonly create?: ReadonlyArray<PostCreateInput> | PostCreateInput | null
  readonly connect?: ReadonlyArray<PostWhereUniqueInput> | PostWhereUniqueInput | null
}

export type KeystoneAdminUIFieldMetaIsNonNull =
  | 'read'
  | 'create'
  | 'update'

export type KeystoneAdminUIFieldMetaCreateViewFieldMode =
  | 'edit'
  | 'hidden'

export type KeystoneAdminUIFieldMetaListViewFieldMode =
  | 'read'
  | 'hidden'

export type KeystoneAdminUIFieldMetaItemViewFieldMode =
  | 'edit'
  | 'read'
  | 'hidden'

export type KeystoneAdminUIFieldMetaItemViewFieldPosition =
  | 'form'
  | 'sidebar'

export type QueryMode =
  | 'default'
  | 'insensitive'

export type KeystoneAdminUISortDirection =
  | 'ASC'
  | 'DESC'

type ResolvedPostCreateInput = {
  id?: import('./node_modules/myprisma').Prisma.PostCreateInput['id']
  title?: import('./node_modules/myprisma').Prisma.PostCreateInput['title']
  status?: import('./node_modules/myprisma').Prisma.PostCreateInput['status']
  content?: import('./node_modules/myprisma').Prisma.PostCreateInput['content']
  publishDate?: import('./node_modules/myprisma').Prisma.PostCreateInput['publishDate']
  author?: import('./node_modules/myprisma').Prisma.PostCreateInput['author']
}
type ResolvedPostUpdateInput = {
  id?: undefined
  title?: import('./node_modules/myprisma').Prisma.PostUpdateInput['title']
  status?: import('./node_modules/myprisma').Prisma.PostUpdateInput['status']
  content?: import('./node_modules/myprisma').Prisma.PostUpdateInput['content']
  publishDate?: import('./node_modules/myprisma').Prisma.PostUpdateInput['publishDate']
  author?: import('./node_modules/myprisma').Prisma.PostUpdateInput['author']
}
type ResolvedAuthorCreateInput = {
  id?: import('./node_modules/myprisma').Prisma.AuthorCreateInput['id']
  name?: import('./node_modules/myprisma').Prisma.AuthorCreateInput['name']
  posts?: import('./node_modules/myprisma').Prisma.AuthorCreateInput['posts']
}
type ResolvedAuthorUpdateInput = {
  id?: undefined
  name?: import('./node_modules/myprisma').Prisma.AuthorUpdateInput['name']
  posts?: import('./node_modules/myprisma').Prisma.AuthorUpdateInput['posts']
}

export declare namespace Lists {
  export type Post<Session = any> = import('@keystone-6/core').ListConfig<Lists.Post.TypeInfo<Session>>
  namespace Post {
    export type Item = import('./node_modules/myprisma').Post
    export type TypeInfo<Session = any> = {
      key: 'Post'
      isSingleton: false
      fields: 'id' | 'title' | 'status' | 'content' | 'publishDate' | 'author'
      item: Item
      inputs: {
        where: PostWhereInput
        uniqueWhere: PostWhereUniqueInput
        create: PostCreateInput
        update: PostUpdateInput
        orderBy: PostOrderByInput
      }
      prisma: {
        create: ResolvedPostCreateInput
        update: ResolvedPostUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Author<Session = any> = import('@keystone-6/core').ListConfig<Lists.Author.TypeInfo<Session>>
  namespace Author {
    export type Item = import('./node_modules/myprisma').Author
    export type TypeInfo<Session = any> = {
      key: 'Author'
      isSingleton: false
      fields: 'id' | 'name' | 'posts'
      item: Item
      inputs: {
        where: AuthorWhereInput
        uniqueWhere: AuthorWhereUniqueInput
        create: AuthorCreateInput
        update: AuthorUpdateInput
        orderBy: AuthorOrderByInput
      }
      prisma: {
        create: ResolvedAuthorCreateInput
        update: ResolvedAuthorUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
}
export type Context<Session = any> = import('@keystone-6/core/types').KeystoneContext<TypeInfo<Session>>
export type Config<Session = any> = import('@keystone-6/core/types').KeystoneConfig<TypeInfo<Session>>

export type TypeInfo<Session = any> = {
  lists: {
    readonly Post: Lists.Post.TypeInfo<Session>
    readonly Author: Lists.Author.TypeInfo<Session>
  }
  prisma: import('./node_modules/myprisma').PrismaClient
  session: Session
}

type __TypeInfo<Session = any> = TypeInfo<Session>

export type Lists<Session = any> = {
  [Key in keyof TypeInfo['lists']]?: import('@keystone-6/core').ListConfig<TypeInfo<Session>['lists'][Key]>
} & Record<string, import('@keystone-6/core').ListConfig<any>>

export {}
