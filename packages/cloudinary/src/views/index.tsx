import React from 'react'
import type {
  CellComponent,
  FieldControllerConfig,
} from '@keystone-6/core/types'
import {
  type ImageValue,
  validateImage
} from '@keystone-6/core/fields/types/image/views'

export { Field } from '@keystone-6/core/fields/types/image/views'

export const Cell: CellComponent<typeof controller> = ({ value }) => {
  if (!value) return null
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        height: 24,
        lineHeight: 0,
        width: 24,
      }}
    >
      <img
        style={{ maxHeight: '100%', maxWidth: '100%' }}
        src={value.url}
      />
    </div>
  )
}

export function controller (config: FieldControllerConfig) {
  const extensions = ['jpg', 'png', 'webp', 'gif'] // TODO: dynamic
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: `${config.path} {
      id
      url: publicUrlTransformed(transformation: { width: "120" crop: "limit" })
      filesize
      width
      height
    }`,
    defaultValue: { kind: 'empty' },
    extensions,
    deserialize (item: any): ImageValue {
      const value = item[config.path]
      if (!value) return { kind: 'empty' }
      return {
        kind: 'from-server',
        data: value,
      }
    },
    validate (value: ImageValue): boolean {
      return validateImage(extensions, value) === undefined
    },
    serialize (value: ImageValue) {
      if (value.kind === 'upload') {
        return { [config.path]: value.data.file }
      }
      if (value.kind === 'remove') {
        return { [config.path]: null }
      }
      return {}
    },
  }
}
