import {
  component,
  fields,
  FormField,
  NotEditable,
} from '@keystone-6/fields-document/component-blocks'
import { Flex } from '@keystar/ui/layout'
import { TextField } from '@keystar/ui/text-field'
import { DocumentRenderer } from '../../packages/document-renderer/src'
import { Prose } from '@keystar/ui/typography'

type Node = { text: string; children?: undefined } | { text?: undefined; children: Node[] }

function extractVariables(nodes: Node[], vars = new Set<string>()) {
  for (const node of nodes) {
    if ('text' in node && node.text) {
      for (const match of node.text.matchAll(/\{\{(\w+)\}\}/g)) {
        vars.add(match[1])
      }
    } else if ('children' in node && node.children) {
      extractVariables(node.children, vars)
    }
  }
  return vars
}

function replaceVariables(nodes: Node[], vars: Record<string, string>): Node[] {
  return nodes.map(node => {
    if ('text' in node && node.text) {
      return {
        ...node,
        text: node.text.replace(/\{\{(\w+)\}\}/g, (_, match) => {
          return vars[match] || `{{${match}}}`
        }),
      }
    } else if ('children' in node && node.children) {
      return { ...node, children: replaceVariables(node.children, vars) }
    }
    return node
  })
}

export const componentBlocks = {
  dynamicComponent: component({
    label: 'Dynamic Component',
    schema: {
      dynamicComponent: fields.relationship({
        listKey: 'DynamicComponent',
        label: 'Component',
        selection: 'content { document }',
      }),
      variables: {
        ...fields.text({ label: 'Variables' }),
        Input() {
          return null
        },
      },
    },
    preview(props) {
      const content =
        !!props.fields.dynamicComponent.value?.data?.content &&
        typeof props.fields.dynamicComponent.value?.data?.content === 'object' &&
        'document' in props.fields.dynamicComponent.value?.data.content
          ? (props.fields.dynamicComponent.value.data.content.document as Node[])
          : undefined
      const parsedVariables: Record<string, string> = {}
      try {
        Object.assign(parsedVariables, JSON.parse(props.fields.variables.value || '{}'))
      } catch {}

      return (
        <div style={{ userSelect: 'none' }} contentEditable="false">
          <h3>
            Dynamic Component:{' '}
            {props.fields.dynamicComponent.value?.label || 'No component selected'}
          </h3>
          {content && (
            <VariableEditing
              componentContent={content}
              parsedVariables={parsedVariables}
              onChange={props.fields.variables.onChange}
            />
          )}
          {content && (
            <Prose>
              <DocumentRenderer document={replaceVariables(content, parsedVariables) as any} />
            </Prose>
          )}
        </div>
      )
    },
  }),
}

function VariableEditing(props: {
  componentContent: Node[]
  parsedVariables: Record<string, string>
  onChange: (val: string) => void
}) {
  const knownVariables = extractVariables(props.componentContent)
  return (
    <Flex direction="column">
      {[...knownVariables].map(key => {
        return (
          <div key={key}>
            <TextField
              label={key}
              value={props.parsedVariables[key] || ''}
              onChange={val => {
                props.onChange(JSON.stringify({ ...props.parsedVariables, [key]: val }))
              }}
            />
          </div>
        )
      })}
    </Flex>
  )
}
