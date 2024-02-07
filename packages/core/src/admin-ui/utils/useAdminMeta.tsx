import { useMemo } from 'react'
import { type AdminMeta, type FieldViews, getGqlNames } from '../../types'
import { useQuery } from '../apollo'
import { type AdminMetaQuery, adminMetaQuery } from '../admin-meta-graphql'

const expectedExports = new Set(['Cell', 'Field', 'controller', 'CardValue'])

export function useAdminMeta (fieldViews: FieldViews) {
  const { data, error } = useQuery<AdminMetaQuery>(adminMetaQuery)
  const lists = data?.keystone?.adminMeta?.lists

  const result = useMemo(() => {
    if (!lists) return undefined
    if (error) return undefined

    const result: AdminMeta = {
      lists: {},
    }

    for (const list of lists) {
      result.lists[list.key] = {
        ...list,
        groups: [],
        gqlNames: getGqlNames({ listKey: list.key, pluralGraphQLName: list.listQueryName }), // TODO: replace with an object
        fields: {},
      }

      for (const field of list.fields) {
        for (const exportName of expectedExports) {
          if ((fieldViews[field.viewsIndex] as any)[exportName] === undefined) {
            throw new Error(
              `The view for the field at ${list.key}.${field.path} is missing the ${exportName} export`
            )
          }
        }

        Object.keys(fieldViews[field.viewsIndex]).forEach(exportName => {
          if (!expectedExports.has(exportName) && exportName !== 'allowedExportsOnCustomViews') {
            throw new Error(
              `Unexpected export named ${exportName} from the view from the field at ${list.key}.${field.path}`
            )
          }
        })

        const views = { ...fieldViews[field.viewsIndex] }
        const customViews: Record<string, any> = {}
        if (field.customViewsIndex !== null) {
          const customViewsSource: FieldViews[number] & Record<string, any> = fieldViews[field.customViewsIndex]
          const allowedExportsOnCustomViews = new Set(views.allowedExportsOnCustomViews)
          Object.keys(customViewsSource).forEach(exportName => {
            if (allowedExportsOnCustomViews.has(exportName)) {
              customViews[exportName] = customViewsSource[exportName]
            } else if (expectedExports.has(exportName)) {
              (views as any)[exportName] = customViewsSource[exportName]
            } else {
              throw new Error(
                `Unexpected export named ${exportName} from the custom view from field at ${list.key}.${field.path}`
              )
            }
          })
        }

        result.lists[list.key].fields[field.path] = {
          ...field,
          createView: {
            fieldMode: field.createView?.fieldMode ?? null,
          },
          itemView: {
            fieldMode: field.itemView?.fieldMode ?? null,
            fieldPosition: field.itemView?.fieldPosition ?? null,
          },
          listView: {
            fieldMode: field.listView?.fieldMode ?? null,
          },
          graphql: {
            isNonNull: field.isNonNull,
          },
          views,
          controller: views.controller({
            listKey: list.key,
            fieldMeta: field.fieldMeta,
            label: field.label,
            description: field.description,
            path: field.path,
            customViews,
          }),
        }
      }

      for (const group of list.groups) {
        result.lists[list.key].groups.push({
          label: group.label,
          description: group.description,
          fields: group.fields.map(field => result.lists[list.key].fields[field.path]),
        })
      }
    }

    return result
  }, [lists, error, fieldViews])

  if (result) return { state: 'loaded' as const, value: result }
  if (error) {
    return {
      state: 'error' as const,
      error,
    }
  }
  return { state: 'loading' as const }
}
