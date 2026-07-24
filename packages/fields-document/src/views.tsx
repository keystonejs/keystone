'use client'

import { Field as KeystarField } from '@keystar/ui/field'
import { Text } from '@keystar/ui/typography'
import type { CellComponent, FieldProps } from '@keystone-6/core/types'
import { Node } from 'slate'

import { DocumentEditor } from './DocumentEditor/index.tsx'
import { ForceValidationProvider } from './DocumentEditor/utils-hooks.tsx'
import type { controller, DocumentFeatures } from './views-shared.ts'

export { controller } from './views-shared.ts'
export { type DocumentFeatures }

export function Field(props: FieldProps<typeof controller>) {
  const { autoFocus, field, forceValidation, onChange, value } = props

  return (
    <KeystarField label={field.label} description={field.description}>
      {inputProps => (
        <ForceValidationProvider value={!!forceValidation}>
          <DocumentEditor
            {...inputProps}
            autoFocus={autoFocus}
            componentBlocks={field.componentBlocks}
            documentFeatures={field.documentFeatures}
            onChange={onChange}
            relationships={field.relationships}
            value={value}
          />
        </ForceValidationProvider>
      )}
    </KeystarField>
  )
}

function serialize(nodes: Node[]) {
  return nodes.map((n: Node) => Node.string(n)).join('\n')
}

export const Cell: CellComponent<typeof controller> = ({ value }) => {
  if (!value) return null
  return <Text>{serialize(value.document).slice(0, 60)}</Text>
}

export const allowedExportsOnCustomViews = ['componentBlocks']
