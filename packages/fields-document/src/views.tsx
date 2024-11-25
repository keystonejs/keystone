'use client'

import { Field as KeystarField } from '@keystar/ui/field'
import { Text } from '@keystar/ui/typography'
import type { CellComponent, FieldProps } from '@keystone-6/core/types'
import React from 'react'
import { Node } from 'slate'

import { DocumentEditor } from './DocumentEditor'
import { ForceValidationProvider } from './DocumentEditor/utils-hooks'
import { type controller, type DocumentFeatures } from './views-shared'

export { controller } from './views-shared'
export { type DocumentFeatures }

export function Field (props: FieldProps<typeof controller>) {
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

function serialize (nodes: Node[]) {
  return nodes.map((n: Node) => Node.string(n)).join('\n')
}

export const Cell: CellComponent<typeof controller> = ({ value }) => {
  if (!value) return null
  return <Text>{serialize(value).slice(0, 60)}</Text>
}

export const allowedExportsOnCustomViews = ['componentBlocks']
