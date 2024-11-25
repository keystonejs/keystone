/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core'
import {
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
} from '../../../../types'
import { validateImage } from './Field'

export { Field } from './Field'

export const Cell: CellComponent<typeof controller> = ({ value }) => {
  if (!value) return null
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
      <img alt={value.filename} css={{ maxHeight: '100%', maxWidth: '100%' }} src={value.url} />
    </div>
  )
}

type ImageData = {
  src: string
  height: number
  width: number
  filesize: number
  extension: string
  id: string
}

export type ImageValue =
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
      previous: ImageValue
    }
  | { kind: 'remove', previous?: Exclude<ImageValue, { kind: 'remove' }> }

type ImageController = FieldController<ImageValue>

export const controller = (config: FieldControllerConfig): ImageController => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: `${config.path} {
        url
        id
        extension
        width
        height
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
          id: value.id,
          extension: value.extension,
          ref: value.ref,
          width: value.width,
          height: value.height,
          filesize: value.filesize,
        },
      }
    },
    validate (value): boolean {
      return value.kind !== 'upload' || validateImage(value.data) === undefined
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
