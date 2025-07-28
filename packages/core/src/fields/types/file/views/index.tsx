import type { CellComponent, FieldController, FieldControllerConfig } from '../../../../types'

import { validateFile } from './Field'

export { Field } from './Field'

export const Cell: CellComponent<typeof controller> = ({ value }) => {
  if (!value) return null
  return value.filename
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
  | { kind: 'remove'; previous?: Exclude<FileValue, { kind: 'remove' }> }

type FileController = FieldController<FileValue>

export function controller(config: FieldControllerConfig): FileController {
  return {
    fieldKey: config.fieldKey,
    label: config.label,
    description: config.description,
    defaultValue: { kind: 'empty' },
    deserialize(item) {
      const value = item[config.fieldKey]
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
    serialize(value) {
      if (value.kind === 'upload') {
        return { [config.fieldKey]: { upload: value.data.file } }
      }
      if (value.kind === 'remove') {
        return { [config.fieldKey]: null }
      }
      return {}
    },
    validate(value): boolean {
      return value.kind !== 'upload' || validateFile(value.data) === undefined
    },
    graphqlSelection: `${config.fieldKey} {
        url
        filename
        filesize
      }`,
  }
}
