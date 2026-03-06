/* eslint-disable */

export type PostWhereUniqueInput = {
  readonly id?: string | null
}

export type PostWhereInput = {
  readonly AND?: ReadonlyArray<PostWhereInput> | PostWhereInput | null
  readonly OR?: ReadonlyArray<PostWhereInput> | PostWhereInput | null
  readonly NOT?: ReadonlyArray<PostWhereInput> | PostWhereInput | null
  readonly id?: IDFilter | null
  readonly title?: StringFilter | null
  readonly content?: StringFilter | null
  readonly publishDate?: DateTimeNullableFilter | null
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
  readonly content?: OrderDirection | null
  readonly publishDate?: OrderDirection | null
}

export type OrderDirection =
  | 'asc'
  | 'desc'

export type PostUpdateInput = {
  readonly title?: string | null
  readonly content?: string | null
  readonly publishDate?: any | null
}

export type PostUpdateArgs = {
  readonly where: PostWhereUniqueInput
  readonly data: PostUpdateInput
}

export type PostCreateInput = {
  readonly title?: string | null
  readonly content?: string | null
  readonly publishDate?: any | null
}

export type KeystoneAdminUIFieldMetaIsNonNull =
  | 'read'
  | 'create'
  | 'update'

export type KeystoneAdminUIFieldMetaItemViewFieldPosition =
  | 'form'
  | 'sidebar'

export type KeystoneAdminUIFieldMetaListViewFieldMode =
  | 'read'
  | 'hidden'

export type QueryMode =
  | 'default'
  | 'insensitive'

export type KeystoneAdminUIActionMetaItemViewNavigation =
  | 'follow'
  | 'refetch'
  | 'return'

export type KeystoneAdminUIActionMetaListViewActionMode =
  | 'enabled'
  | 'hidden'

export type KeystoneAdminUISortDirection =
  | 'ASC'
  | 'DESC'

type ResolvedPostCreateInput = {
  id?: import('./node_modules/myprisma').Prisma.PostCreateInput['id']
  title?: import('./node_modules/myprisma').Prisma.PostCreateInput['title']
  content?: import('./node_modules/myprisma').Prisma.PostCreateInput['content']
  publishDate?: import('./node_modules/myprisma').Prisma.PostCreateInput['publishDate']
}
type ResolvedPostUpdateInput = {
  id?: undefined
  title?: import('./node_modules/myprisma').Prisma.PostUpdateInput['title']
  content?: import('./node_modules/myprisma').Prisma.PostUpdateInput['content']
  publishDate?: import('./node_modules/myprisma').Prisma.PostUpdateInput['publishDate']
}

export interface Session {}

export declare namespace Lists {
  export type Post = import('@keystone-6/core/types').ListConfig<Lists.Post.TypeInfo>
  namespace Post {
    export type Item = import('./node_modules/myprisma').Post
    export type TypeInfo = {
      key: 'Post'
      isSingleton: false
      fields: 'id' | 'title' | 'content' | 'publishDate'
      actions: never
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
      all: __TypeInfo
    }
  }
}
export type Context = import('@keystone-6/core/types').KeystoneContext<TypeInfo>
export type Config = import('@keystone-6/core/types').KeystoneConfig<TypeInfo>

export type TypeInfo = {
  lists: {
    readonly Post: Lists.Post.TypeInfo
  }
  prisma: import('./node_modules/myprisma').PrismaClient
  session: Session
}

type __TypeInfo = TypeInfo

export type Lists = {
  [Key in keyof TypeInfo['lists']]?: import('@keystone-6/core/types').ListConfig<TypeInfo['lists'][Key]>
} & Record<string, import('@keystone-6/core/types').ListConfig<any>>

export {}
