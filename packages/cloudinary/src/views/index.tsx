import React from 'react'
import type {
  CellComponent,
  FieldController,
  FieldControllerConfig,
} from '@keystone-6/core/types'
import { validateImage } from './Field'

export { Field } from './Field'

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
        alt={value.filename}
        style={{ maxHeight: '100%', maxWidth: '100%' }}
        src={value.publicUrlTransformed}
      />
    </div>
  )
}

type ImageData = {
  id: string
  filename: string
  publicUrlTransformed: string
}

type CloudinaryImageValue =
  | { kind: 'empty' }
  | {
      kind: 'from-server'
      data: ImageData
    }
  | {
      kind: 'upload'
      data: {
        file: File
        validity: ValidityState
      }
      previous: CloudinaryImageValue
    }
  | { kind: 'remove', previous: Exclude<CloudinaryImageValue, { kind: 'remove' }> }

type CloudinaryImageController = FieldController<CloudinaryImageValue>

export function controller (config: FieldControllerConfig): CloudinaryImageController {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: `${config.path} {
        id
        filename
        publicUrlTransformed(transformation: { width: "120" crop: "limit" })
      }`,
    defaultValue: { kind: 'empty' },
    deserialize (item) {
      const value = item[config.path]
      if (!value) return { kind: 'empty' }
      return {
        kind: 'from-server',
        data: value,
      }
    },
    validate (value) {
      return value.kind !== 'upload' || validateImage(value.data) === undefined
    },
    serialize (value) {
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
