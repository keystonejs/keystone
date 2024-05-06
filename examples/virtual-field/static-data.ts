import { graphql } from '@keystone-6/core'
import { JSONValue } from '@keystone-6/core/types'

export type FieldPropsType = {
  listKey: string;
  fieldPath: string;
  props: JSONValue;
}

const FieldProps = graphql.object<FieldPropsType>()({
  name: "FieldProps",
  fields: {
    listKey: graphql.field({ type: graphql.nonNull(graphql.String) }),
    fieldPath: graphql.field({ type: graphql.nonNull(graphql.String) }),
    props: graphql.field({ type: graphql.nonNull(graphql.JSON) }),
  },
})

export const FieldPropsData: FieldPropsType[] = [
  {
    listKey: "Post",
    fieldPath: "tags",
    props: {
      joinListKey: "PostTag",
      localFieldKey: "post",
      foreignFieldKey: "tag",
    }
  },
]

export const extendGraphqlSchema = graphql.extend(base => {
  return {
    query: {
      FieldProps: graphql.field({
        type: FieldProps,
        args: {
          listKey: graphql.arg({ type: graphql.nonNull(graphql.String) }),
          fieldPath: graphql.arg({ type: graphql.nonNull(graphql.String) }),
        },
        resolve: (_, args) => {
          return FieldPropsData.find((x) =>
            x.listKey === args.listKey && x.fieldPath === args.fieldPath
          )
        }
      }),
    }
  }
})

export default extendGraphqlSchema