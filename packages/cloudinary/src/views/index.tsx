import type { CellComponent, FieldControllerConfig } from '@keystone-6/core/types'
import { type ImageValue, validateImage } from '@keystone-6/core/fields/types/image/views'

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
      <img style={{ maxHeight: '100%', maxWidth: '100%' }} src={value.url} />
    </div>
  )
}

export function controller(config: FieldControllerConfig) {
  const extensions = ['jpg', 'png', 'webp', 'gif'] // TODO: dynamic
  return {
    fieldKey: config.fieldKey,
    label: config.label,
    description: config.description,
    defaultValue: { kind: 'empty' },
    extensions,
    deserialize(item: any): ImageValue {
      const value = item[config.fieldKey]
      if (!value) return { kind: 'empty' }
      return {
        kind: 'from-server',
        data: value,
      }
    },
    serialize(value: ImageValue) {
      if (value.kind === 'upload') {
        return { [config.fieldKey]: value.data.file }
      }
      if (value.kind === 'remove') {
        return { [config.fieldKey]: null }
      }
      return {}
    },
    validate(value: ImageValue): boolean {
      return validateImage(extensions, value) === undefined
    },
    graphqlSelection: `${config.fieldKey} {
      id
      url: publicUrlTransformed(transformation: { width: "120" crop: "limit" })
      filesize
      width
      height
    }`,
  }
}
