'use client'
import type { CellComponent, FieldController, FieldControllerConfig } from '../../../../types'
import { SUPPORTED_IMAGE_EXTENSIONS } from '../utils'

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
      <img style={{ maxHeight: '100%', maxWidth: '100%' }} src={value.url} />
    </div>
  )
}

export type ImageValue =
  | { kind: 'empty' }
  | {
      kind: 'from-server'
      data: {
        id: string
        url: string
        extension: string
        filesize: number
        width: number
        height: number
      }
    }
  | {
      kind: 'upload'
      data: {
        file: File
        validity: ValidityState
      }
      previous: ImageValue
    }
  | { kind: 'remove'; previous?: Exclude<ImageValue, { kind: 'remove' }> }

export function validateImage(extensions: readonly string[], v: ImageValue) {
  if (v.kind !== 'upload') return
  if (!v.data.validity.valid) return 'Something went wrong, please reload and try again.'

  // check if the file is actually an image
  if (!v.data.file.type.includes('image')) {
    return `Sorry, that file type isn't accepted. Please try ${extensions.join(', ')}`
  }
}

export function controller(
  config: FieldControllerConfig
): FieldController<ImageValue> & { extensions: readonly string[] } {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: `${config.path} {
      id
      url
      extension
      filesize
      width
      height
    }`,
    defaultValue: { kind: 'empty' },
    extensions: SUPPORTED_IMAGE_EXTENSIONS,
    deserialize(item: any): ImageValue {
      const value = item[config.path]
      if (!value) return { kind: 'empty' }
      return {
        kind: 'from-server',
        data: value,
      }
    },
    validate(value: ImageValue): boolean {
      return validateImage(SUPPORTED_IMAGE_EXTENSIONS, value) === undefined
    },
    serialize(value: ImageValue) {
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
