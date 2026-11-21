import type { KeystoneContext } from '@keystone-6/core/types'
import type { GraphQLField } from 'graphql/index.js'

type Context = Pick<KeystoneContext, 'graphql'>
type Operation = 'query' | 'mutation'
type FieldArgs = { query?: string; [name: string]: unknown }
type Fields = Record<string, <T = unknown>(args?: FieldArgs) => Promise<T>>

async function runField<T>(
  context: Context,
  operation: Operation,
  field: GraphQLField<unknown, unknown>,
  { query: selection, ...args }: FieldArgs = {}
): Promise<T> {
  const variables = Object.fromEntries(
    Object.entries(args).filter(([, value]) => value !== undefined)
  )
  const variableDefinitions: string[] = []
  const fieldArguments: string[] = []
  for (const name of Object.keys(variables)) {
    const arg = field.args.find(arg => arg.name === name)
    if (!arg) throw new Error(`Unknown argument "${name}" on ${operation} field "${field.name}"`)

    variableDefinitions.push(`$${name}: ${arg.type.toString()}`)
    fieldArguments.push(`${name}: $${name}`)
  }

  const query = `
    ${operation}${variableDefinitions.length ? `(${variableDefinitions.join(', ')})` : ''} {
      ${field.name}${fieldArguments.length ? `(${fieldArguments.join(', ')})` : ''}
      ${selection === undefined ? '' : `{\n${selection}\n}`}
    }
  `
  const data = await context.graphql.run<Record<string, T>, typeof variables>({ query, variables })
  return data[field.name]
}

function operationFields(context: Context, operation: Operation): Fields {
  const { schema } = context.graphql
  const root = operation === 'query' ? schema.getQueryType() : schema.getMutationType()
  const fields = root?.getFields()

  return new Proxy<Fields>(
    {},
    {
      get(_target, name) {
        if (typeof name !== 'string') return undefined
        const field = fields?.[name]
        // Promise resolution probes for a then method.
        if (!field && name === 'then') return undefined

        return async <T>(args?: FieldArgs) => {
          if (!field) throw new Error(`Unknown ${operation} field "${name}"`)
          return runField<T>(context, operation, field, args)
        }
      },
    }
  )
}

export function query(context: Context): Fields {
  return operationFields(context, 'query')
}

export function mutation(context: Context): Fields {
  return operationFields(context, 'mutation')
}
