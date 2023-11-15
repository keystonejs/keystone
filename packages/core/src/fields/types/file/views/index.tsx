/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core'
import { FieldContainer, FieldLabel } from '@keystone-ui/fields'
import {
  type CardValueComponent,
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
} from '../../../../types'

import { validateFile } from './Field'

export { Field } from './Field'

export const Cell: CellComponent = ({ item, field }) => {
  const data = item[field.path]
  if (!data) return null
  return (
    <div
      css={{
        alignItems: 'center',
        display: 'flex',
        height: 24,
        lineHeight: 0,
        width: 24,
      }}
    >
      {data.filename}
    </div>
  )
}

export const CardValue: CardValueComponent = ({ item, field }) => {
  const data = item[field.path]
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {data && data.filename}
    </FieldContainer>
  )
}

type FileData = {
  src: string
  filesize: number
  filename: string
}

export type FileValue =
  | { kind: 'empty' }
  | {
      kind: 'from-server'
      data: FileData
    }
  | {
      kind: 'upload'
      data: {
        file: File
        validity: ValidityState
      }
      previous: FileValue
    }
  | { kind: 'remove', previous?: Exclude<FileValue, { kind: 'remove' }> }

type FileController = FieldController<FileValue>

export const controller = (config: FieldControllerConfig): FileController => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: `${config.path} {
        url
        filename
        filesize
      }`,
    defaultValue: { kind: 'empty' },
    deserialize (item) {
      const value = item[config.path]
      if (!value) return { kind: 'empty' }
      return {
        kind: 'from-server',
        data: {
          src: value.url,
          filename: value.filename,
          ref: value.ref,
          filesize: value.filesize,
          storage: value.storage,
        },
      }
    },
    validate (value): boolean {
      return value.kind !== 'upload' || validateFile(value.data) === undefined
    },
    serialize (value) {
      if (value.kind === 'upload') {
        return { [config.path]: { upload: value.data.file } }
      }
      if (value.kind === 'remove') {
        return { [config.path]: null }
      }
      return {}
    },
  }
}
