/** @jsxRuntime classic */
/** @jsx jsx */
'use client'

import { jsx } from '@keystone-ui/core'
import { FieldContainer, FieldDescription, FieldLabel } from '@keystone-ui/fields'
import { Node } from 'slate'
import { DocumentRenderer } from '@keystone-6/document-renderer'

import {
  type CardValueComponent,
  type CellComponent,
  type FieldProps,
} from '@keystone-6/core/types'
import { CellContainer, CellLink } from '@keystone-6/core/admin-ui/components'

import { DocumentEditor } from './DocumentEditor'
import { ForceValidationProvider } from './DocumentEditor/utils-hooks'
import {
  type controller,
  type DocumentFeatures,
} from './views-shared'

export {
  controller,
} from './views-shared'

export { type DocumentFeatures }
export function Field ({
  field,
  value,
  onChange,
  autoFocus,
  forceValidation,
}: FieldProps<typeof controller>) {
  return <FieldContainer>
    <FieldLabel as="span" id={`${field.path}-label`}>
      {field.label}
    </FieldLabel>
    <FieldDescription id={`${field.path}-description`}>{field.description}</FieldDescription>
    <ForceValidationProvider value={!!forceValidation}>
      <DocumentEditor
        autoFocus={autoFocus}
        aria-labelledby={`${field.path}-label`}
        value={value}
        onChange={onChange}
        componentBlocks={field.componentBlocks}
        relationships={field.relationships}
        documentFeatures={field.documentFeatures}
      />
    </ForceValidationProvider>
  </FieldContainer>
}

function serialize (nodes: Node[]) {
  return nodes.map((n: Node) => Node.string(n)).join('\n')
}

export const Cell: CellComponent = ({ item, field, linkTo }) => {
  const value = item[field.path]?.document
  if (!value) return null
  const plainText = serialize(value)
  const cutText = plainText.length > 100 ? plainText.slice(0, 100) + '...' : plainText
  return linkTo ? (
    <CellLink {...linkTo}>{cutText}</CellLink>
  ) : (
    <CellContainer>{cutText}</CellContainer>
  )
}
Cell.supportsLinkTo = true

export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <DocumentRenderer document={item[field.path]?.document || []} />
    </FieldContainer>
  )
}

export const allowedExportsOnCustomViews = ['componentBlocks']
