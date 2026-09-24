import { beforeEach, expect, test, vi } from 'vitest'
import { IncomingMessage } from 'node:http'
import { Socket } from 'node:net'
import { action, config, g, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { bytes, json, relationship, text, timestamp } from '@keystone-6/core/fields'
import { Decimal } from '@keystone-6/core/types'
import { createSystem } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/artifacts'
import { snapshotTransactionValue } from '../../packages/core/src/lib/context/transaction-hooks.ts'
import { setupTestRunner } from './test-runner.ts'

type Phase = 'before' | 'after' | 'commit' | 'rollback' | 'fieldCommit' | 'fieldRollback'
const events: { phase: Phase; args: any }[] = []
const handlers: Partial<Record<Phase, (args: any) => void | Promise<void>>> = {}
const record = (phase: Phase) => async (args: any) => {
  events.push({ phase, args })
  await handlers[phase]?.(args)
}
const callbacks = (phase: Phase) => events.filter(event => event.phase === phase).map(x => x.args)
const fieldHooks = {
  transaction: { afterCommit: record('fieldCommit'), afterRollback: record('fieldRollback') },
}

beforeEach(() => {
  events.length = 0
  for (const phase of Object.keys(handlers) as Phase[]) delete handlers[phase]
  vi.restoreAllMocks()
})

const runner = setupTestRunner({
  config: {
    session: {
      get: async ({ context }) => ({ actor: context.req?.headers.actor, read: true }),
      start: async () => {},
      end: async () => {},
    },
    lists: {
      Entry: list({
        access: {
          operation: {
            query: ({ session }) => session?.read !== false,
            create: allowAll,
            update: allowAll,
            delete: allowAll,
          },
        },
        fields: {
          name: text({ isIndexed: 'unique', hooks: fieldHooks }),
          other: text({ hooks: fieldHooks }),
          payload: json(),
          at: timestamp(),
          binary: bytes(),
          secret: text({ graphql: { omit: true } }),
          parent: relationship({ ref: 'Entry.children' }),
          children: relationship({ ref: 'Entry.parent', many: true }),
        },
        hooks: {
          beforeOperation: record('before'),
          afterOperation: record('after'),
          transaction: { afterCommit: record('commit'), afterRollback: record('rollback') },
        },
      }),
      Audit: list({ access: allowAll, fields: { entry: text() } }),
      Selective: list({
        access: allowAll,
        fields: {
          name: text({
            hooks: {
              transaction: {
                afterCommit: { create: record('fieldCommit'), delete: record('fieldCommit') },
                afterRollback: { create: record('fieldRollback'), delete: record('fieldRollback') },
              },
            },
          }),
        },
        hooks: {
          transaction: {
            afterCommit: { update: record('commit') },
            afterRollback: { update: record('rollback') },
          },
        },
      }),
    },
  },
})

test(
  'existing hooks stay transactional; commit callbacks await settlement and have a usable context',
  runner(async ({ context }) => {
    const order: string[] = []
    let transactionClient: unknown
    handlers.after = async args => {
      expect(args.context.prisma).toBe(transactionClient)
      expect(await args.context.db.Entry.count()).toBe(1)
      await args.context.db.Audit.createOne({ data: { entry: args.item.id } })
      order.push('afterOperation')
    }
    handlers.commit = async args => {
      expect(args.context.prisma).not.toBe(transactionClient)
      expect(await args.context.db.Entry.findOne({ where: { id: args.item.id } })).toMatchObject({
        name: 'created',
      })
      expect(await args.context.db.Audit.count()).toBe(1)
      order.push('commit')
    }

    const result = await context.transaction(async tx => {
      transactionClient = tx.prisma
      await tx.db.Entry.createOne({ data: { name: 'created' } })
      expect(callbacks('before')).toHaveLength(1)
      expect(callbacks('after')).toHaveLength(1)
      expect(callbacks('commit')).toEqual([])
      expect(callbacks('fieldCommit')).toEqual([])
      order.push('callback finished')
      return 42
    })
    expect(result).toBe(42)
    expect(order).toEqual(['afterOperation', 'callback finished', 'commit'])
    expect(callbacks('rollback')).toEqual([])
  })
)

test(
  'rollback includes successful writes and afterOperation database work, without commit callbacks',
  runner(async ({ context }) => {
    const failure = new Error('abort transaction')
    handlers.after = async ({ item, context }) => {
      await context.db.Audit.createOne({ data: { entry: item.id } })
    }
    handlers.rollback = async ({ context: callbackContext, item, error }) => {
      expect(error).toBe(failure)
      expect(item.name).toBe('rolled back')
      expect(await callbackContext.db.Entry.findOne({ where: { id: item.id } })).toBeNull()
      expect(await callbackContext.db.Audit.count()).toBe(0)
    }
    await expect(
      context.transaction(async tx => {
        await tx.db.Entry.createOne({ data: { name: 'rolled back' } })
        throw failure
      })
    ).rejects.toBe(failure)
    expect(callbacks('rollback')).toHaveLength(1)
    expect(callbacks('fieldRollback')).toHaveLength(1)
    expect(callbacks('commit')).toEqual([])
  })
)

test(
  'afterOperation failure still has a registered rollback callback',
  runner(async ({ context }) => {
    handlers.after = () => {
      throw new Error('afterOperation failed')
    }
    await expect(
      context.transaction(tx => tx.db.Entry.createOne({ data: { name: 'attempt' } }))
    ).rejects.toThrow('afterOperation failed')
    expect(await context.prisma.entry.count()).toBe(0)
    expect(callbacks('rollback')).toHaveLength(1)
    expect(callbacks('rollback')[0].error.extensions.code).toBe('KS_EXTENSION_ERROR')
    expect(callbacks('rollback')[0].item.name).toBe('attempt')
    expect(callbacks('commit')).toEqual([])
  })
)

test(
  'finishing the user callback is not proof of commit',
  runner(async ({ context }) => {
    const failure = new Error('settlement failed after user callback')
    const transaction = context.prisma.$transaction.bind(context.prisma)
    const spy = vi
      .spyOn(context.prisma, '$transaction')
      .mockImplementation((callback: any, options: any) =>
        transaction(async (client: any) => {
          await callback(client)
          expect(callbacks('commit')).toEqual([])
          throw failure
        }, options)
      )
    try {
      await expect(
        context.transaction(tx => tx.db.Entry.createOne({ data: { name: 'attempt' } }))
      ).rejects.toBe(failure)
      expect(callbacks('rollback')).toHaveLength(1)
      expect(callbacks('commit')).toEqual([])
      expect(await context.prisma.entry.count()).toBe(0)
    } finally {
      spy.mockRestore()
    }
  })
)

test(
  'all field/list commit callbacks are attempted, and failure cannot roll back committed data',
  runner(async ({ context }) => {
    handlers.fieldCommit = () => {
      throw 'field notification failed'
    }
    handlers.commit = () => {
      throw new Error('list notification failed')
    }
    await expect(
      context.transaction(async tx => {
        await tx.db.Entry.createOne({ data: { name: 'first', other: 'first' } })
        await tx.db.Entry.createOne({ data: { name: 'second', other: 'second' } })
      })
    ).rejects.toMatchObject({
      extensions: { code: 'KS_EXTENSION_ERROR' },
      message: expect.stringContaining('transaction.afterCommit'),
    })
    expect(callbacks('fieldCommit')).toHaveLength(4)
    expect(callbacks('commit')).toHaveLength(2)
    expect(callbacks('rollback')).toEqual([])
    expect(await context.prisma.entry.count()).toBe(2)
  })
)

test(
  'rollback callback failures are logged after all callbacks and preserve the original failure',
  runner(async ({ context }) => {
    const failure = new Error('original failure')
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    handlers.fieldRollback = () => {
      throw new Error('field cleanup failed')
    }
    handlers.rollback = () => {
      throw new Error('list cleanup failed')
    }
    try {
      await expect(
        context.transaction(async tx => {
          await tx.db.Entry.createOne({ data: { name: 'first', other: 'first' } })
          await tx.db.Entry.createOne({ data: { name: 'second', other: 'second' } })
          throw failure
        })
      ).rejects.toBe(failure)
      expect(callbacks('fieldRollback')).toHaveLength(4)
      expect(callbacks('rollback')).toHaveLength(2)
      expect(callbacks('rollback').every(args => args.error === failure)).toBe(true)
      expect(log).toHaveBeenCalledOnce()
      expect(log.mock.calls[0][0]).toMatchObject({
        extensions: { code: 'KS_EXTENSION_ERROR' },
        message: expect.stringContaining('transaction.afterRollback'),
      })
      expect(await context.prisma.entry.count()).toBe(0)
    } finally {
      log.mockRestore()
    }
  })
)

test(
  'rollback preserves non-Error transaction failures even when cleanup also throws',
  runner(async ({ context }) => {
    const failure = { reason: 'abort' }
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    handlers.rollback = () => {
      throw 'cleanup failed'
    }
    await expect(
      context.transaction(async tx => {
        await tx.db.Entry.createOne({ data: { name: 'attempt' } })
        throw failure
      })
    ).rejects.toBe(failure)
    expect(callbacks('rollback')[0].error).toBe(failure)
    expect(log).toHaveBeenCalledOnce()
    expect(log.mock.calls[0][0].message).toContain('cleanup failed')
    expect(await context.prisma.entry.count()).toBe(0)
  })
)

test(
  'derived contexts retain registrations and originating permissions/session',
  runner(async ({ context }) => {
    handlers.commit = async ({ context: origin, item }) => {
      expect(origin.session.actor).toBe(item.name)
      expect(origin.__internal.sudo).toBe(item.name === 'sudo')
      if (item.name === 'regular') {
        expect(await origin.db.Entry.count()).toBe(0)
        expect(origin.graphql.schema.getType('Entry').getFields().secret).toBeUndefined()
      } else {
        expect(await origin.db.Entry.count()).toBe(3)
        expect(
          await origin.query.Entry.findOne({ where: { id: item.id }, query: 'secret' })
        ).toEqual({ secret: item.name })
      }
    }
    await context.withSession({ actor: 'outer', read: false }).transaction(async tx => {
      await tx
        .withSession({ actor: 'regular', read: false })
        .db.Entry.createOne({ data: { name: 'regular' } })
      await tx
        .internal()
        .withSession({ actor: 'internal', read: true })
        .db.Entry.createOne({ data: { name: 'internal', secret: 'internal' } })
      await tx
        .sudo()
        .withSession({ actor: 'sudo', read: false })
        .db.Entry.createOne({ data: { name: 'sudo', secret: 'sudo' } })
      expect(callbacks('commit')).toEqual([])
    })
    expect(callbacks('commit')).toHaveLength(3)
  })
)

test(
  'request-derived contexts preserve request/session and their transaction queue',
  runner(async ({ context }) => {
    const req = new IncomingMessage(new Socket())
    req.headers.actor = 'request'
    handlers.commit = async args => {
      expect(args.context.req).toBe(req)
      expect(args.context.session).toEqual({ actor: 'request', read: true })
      expect(await args.context.db.Entry.count()).toBe(1)
    }
    await context.transaction(async tx => {
      const requested = await tx.withRequest(req)
      await requested.db.Entry.createOne({ data: { name: 'request' } })
      expect(callbacks('commit')).toEqual([])
    })
    expect(callbacks('commit')).toHaveLength(1)
  })
)

test(
  'repeated updates produce separate immutable-at-registration operation snapshots',
  runner(async ({ context }) => {
    const session = { actor: 'original', read: true }
    const payload = { nested: { value: 'original' } }
    handlers.after = ({ item, resolvedData }) => {
      if (item.payload) item.payload.nested.value = 'mutated in afterOperation'
      if (resolvedData.payload) resolvedData.payload.nested.value = 'mutated input'
    }
    await context.withSession(session).transaction(async tx => {
      const item = await tx.db.Entry.createOne({
        data: { name: 'one', payload, at: '2025-01-01T00:00:00.000Z', binary: '0102' },
      })
      session.actor = 'changed later'
      await tx.db.Entry.updateOne({ where: { id: item.id.toString() }, data: { name: 'two' } })
      await tx.db.Entry.updateOne({ where: { id: item.id.toString() }, data: { name: 'three' } })
    })
    const [create, update1, update2] = callbacks('commit')
    expect(callbacks('commit')).toHaveLength(3)
    expect(create).toMatchObject({
      item: { name: 'one', payload: { nested: { value: 'original' } } },
      inputData: { payload: { nested: { value: 'original' } } },
      resolvedData: { payload: { nested: { value: 'original' } } },
    })
    expect(create.item.at).toBeInstanceOf(Date)
    expect(Array.from(create.item.binary)).toEqual([1, 2])
    expect(create.context.session.actor).toBe('original')
    expect(update1.originalItem.name).toBe('one')
    expect(update1.item.name).toBe('two')
    expect(update2.originalItem.name).toBe('two')
    expect(update2.item.name).toBe('three')
  })
)

test.each(['commit', 'rollback'] as const)(
  'bulk create/update/delete register each write once on %s',
  phase =>
    runner(async ({ context }) => {
      const failure = new Error('rollback bulk')
      const run = context.transaction(async tx => {
        const items = await tx.db.Entry.createMany({
          data: [
            { name: 'a', other: 'A' },
            { name: 'b', other: 'B' },
          ],
        })
        await tx.db.Entry.updateMany({
          data: items.map(item => ({
            where: { id: item.id.toString() },
            data: { other: 'updated' },
          })),
        })
        await tx.db.Entry.deleteMany({ where: items.map(item => ({ id: item.id.toString() })) })
        if (phase === 'rollback') throw failure
      })
      if (phase === 'rollback') await expect(run).rejects.toBe(failure)
      else await run

      expect(callbacks(phase).map(args => args.operation)).toEqual([
        'create',
        'create',
        'update',
        'update',
        'delete',
        'delete',
      ])
      const fieldPhase = phase === 'commit' ? 'fieldCommit' : 'fieldRollback'
      const fields = callbacks(fieldPhase)
      expect(fields.filter(args => args.operation === 'create')).toHaveLength(4)
      expect(fields.filter(args => args.operation === 'update').map(args => args.fieldKey)).toEqual(
        ['other', 'other']
      )
      expect(fields.filter(args => args.operation === 'delete')).toHaveLength(4)
      for (const deleted of callbacks(phase).filter(args => args.operation === 'delete')) {
        expect(deleted.item).toBeUndefined()
        expect(deleted.inputData).toBeUndefined()
        expect(deleted.resolvedData).toBeUndefined()
        expect(deleted.originalItem.other).toBe('updated')
      }
    })()
)

test(
  'rolled-back deletes retain deleted snapshots, and their callback context sees the restored row',
  runner(async ({ context }) => {
    const original = await context.db.Entry.createOne({ data: { name: 'existing' } })
    handlers.rollback = async ({ context, item, originalItem }) => {
      expect(item).toBeUndefined()
      expect(originalItem).toMatchObject({ id: original.id, name: 'existing' })
      expect(await context.db.Entry.findOne({ where: { id: original.id } })).toMatchObject({
        name: 'existing',
      })
    }
    await expect(
      context.transaction(async tx => {
        await tx.db.Entry.deleteOne({ where: { id: original.id.toString() } })
        throw new Error('undo delete')
      })
    ).rejects.toThrow('undo delete')
    expect(callbacks('rollback')).toHaveLength(1)
    expect(
      callbacks('fieldRollback').find(args => args.fieldKey === 'name').originalItemField
    ).toBe('existing')
  })
)

test(
  'nested relationship creates register children before the parent, without double registration',
  runner(async ({ context }) => {
    await context.transaction(tx =>
      tx.db.Entry.createOne({
        data: {
          name: 'parent',
          children: { create: [{ name: 'child', children: { create: [{ name: 'grandchild' }] } }] },
        },
      })
    )
    expect(callbacks('commit').map(args => args.item.name)).toEqual([
      'grandchild',
      'child',
      'parent',
    ])
    expect(callbacks('after').map(args => args.item.name)).toEqual([
      'grandchild',
      'child',
      'parent',
    ])
  })
)

test(
  'nested creates are registered even if parent validation fails before child afterOperation runs',
  runner(async ({ context }) => {
    await expect(
      context.transaction(tx =>
        tx.db.Entry.createOne({
          data: {
            name: null,
            children: { create: [{ name: 'child' }] },
          },
        })
      )
    ).rejects.toThrow()
    expect(callbacks('after')).toEqual([])
    expect(callbacks('commit')).toEqual([])
    expect(callbacks('rollback').map(args => args.item.name)).toEqual(['child'])
    expect(await context.prisma.entry.count()).toBe(0)
  })
)

test(
  'failed writes and failures before a write do not register item callbacks',
  runner(async ({ context }) => {
    handlers.before = () => {
      throw new Error('before failed')
    }
    await expect(
      context.transaction(tx => tx.db.Entry.createOne({ data: { name: 'before' } }))
    ).rejects.toThrow('before failed')
    expect(callbacks('rollback')).toEqual([])
    delete handlers.before
    await expect(
      context.transaction(async tx => {
        await tx.db.Entry.createOne({ data: { name: 'duplicate' } })
        await tx.db.Entry.createOne({ data: { name: 'duplicate' } })
      })
    ).rejects.toThrow()
    expect(callbacks('rollback')).toHaveLength(1)
  })
)

test(
  'ordinary mutations and raw Prisma writes do not generate transaction callbacks',
  runner(async ({ context }) => {
    const item = await context.db.Entry.createOne({ data: { name: 'outside' } })
    await context.db.Entry.updateOne({
      where: { id: item.id.toString() },
      data: { other: 'updated' },
    })
    await context.db.Entry.deleteOne({ where: { id: item.id.toString() } })
    expect(callbacks('after')).toHaveLength(3)
    await context.transaction(async tx => {
      await tx.prisma.entry.create({ data: { name: 'raw' } })
    })
    expect(callbacks('after')).toHaveLength(3)
    expect(callbacks('commit')).toEqual([])
    expect(callbacks('rollback')).toEqual([])
  })
)

test(
  'nested transactions remain unsupported and do not create an independent lifecycle',
  runner(async ({ context }) => {
    await expect(
      context.transaction(async tx => {
        await tx.db.Entry.createOne({ data: { name: 'outer' } })
        await tx.sudo().transaction(async () => {})
      })
    ).rejects.toThrow('Nested context.transaction() calls are not supported')
    expect(callbacks('rollback')).toHaveLength(1)
    expect(callbacks('commit')).toEqual([])
    expect(await context.prisma.entry.count()).toBe(0)
  })
)

test.each(['raw', 'run'] as const)(
  'GraphQL %s outcomes follow whether the transaction callback throws',
  mode =>
    runner(async ({ context }) => {
      handlers.after = () => {
        throw new Error('GraphQL hook failed')
      }
      const run = context.transaction(async tx => {
        const result = await tx.graphql[mode]({
          query: 'mutation { createEntry(data: { name: "graphql" }) { id } }',
        })
        expect(result).toHaveProperty('errors.length', 1)
      })
      if (mode === 'raw') {
        await run
        expect(callbacks('commit')).toHaveLength(1)
        expect(callbacks('rollback')).toEqual([])
        expect(await context.prisma.entry.count()).toBe(1)
      } else {
        await expect(run).rejects.toThrow('GraphQL hook failed')
        expect(callbacks('commit')).toEqual([])
        expect(callbacks('rollback')).toHaveLength(1)
        expect(await context.prisma.entry.count()).toBe(0)
      }
    })()
)

test(
  'separate transactions and transactions started from a callback do not share registrations',
  runner(async ({ context }) => {
    handlers.commit = async ({ item, context }) => {
      if (item.name === 'first')
        await context.transaction((tx: any) =>
          tx.db.Entry.createOne({ data: { name: 'from callback' } })
        )
    }
    await context.transaction(tx => tx.db.Entry.createOne({ data: { name: 'first' } }))
    await expect(
      context.transaction(async tx => {
        await tx.db.Entry.createOne({ data: { name: 'rollback only' } })
        throw new Error('rollback')
      })
    ).rejects.toThrow('rollback')
    await context.transaction(tx => tx.db.Entry.createOne({ data: { name: 'last' } }))
    expect(callbacks('commit').map(args => args.item.name)).toEqual([
      'first',
      'from callback',
      'last',
    ])
    expect(callbacks('rollback').map(args => args.item.name)).toEqual(['rollback only'])
  })
)

test(
  'a pending commit callback does not capture events from a separate transaction',
  runner(async ({ context }) => {
    let started: () => void = () => {}
    const callbackStarted = new Promise<void>(resolve => {
      started = resolve
    })
    let release: () => void = () => {}
    const finishCallback = new Promise<void>(resolve => {
      release = resolve
    })
    handlers.commit = async ({ item }) => {
      if (item.name === 'committed') {
        started()
        await finishCallback
      }
    }

    const first = context.transaction(tx => tx.db.Entry.createOne({ data: { name: 'committed' } }))
    await callbackStarted
    try {
      await expect(
        context.transaction(async tx => {
          await tx.db.Entry.createOne({ data: { name: 'rolled back' } })
          throw new Error('second failed')
        })
      ).rejects.toThrow('second failed')
      expect(callbacks('commit').map(args => args.item.name)).toEqual(['committed'])
      expect(callbacks('rollback').map(args => args.item.name)).toEqual(['rolled back'])
    } finally {
      release()
      await first
    }
    expect(await context.db.Entry.count()).toBe(1)
  })
)

test.each(['commit', 'rollback'] as const)(
  'operation-specific list and field %s handlers leave unspecified operations disabled',
  phase =>
    runner(async ({ context }) => {
      const failure = new Error('undo')
      const run = context.transaction(async tx => {
        const item = await tx.db.Selective.createOne({ data: { name: 'created' } })
        const where = { id: item.id.toString() }
        await tx.db.Selective.updateOne({ where, data: { name: 'updated' } })
        await tx.db.Selective.deleteOne({ where })
        if (phase === 'rollback') throw failure
      })
      if (phase === 'rollback') await expect(run).rejects.toBe(failure)
      else await run

      expect(callbacks(phase).map(args => args.operation)).toEqual(['update'])
      const fieldPhase = phase === 'commit' ? 'fieldCommit' : 'fieldRollback'
      expect(callbacks(fieldPhase).map(args => args.operation)).toEqual(['create', 'delete'])
      expect(callbacks(fieldPhase)[0].itemField).toBe('created')
      expect(callbacks(fieldPhase)[1].originalItemField).toBe('updated')
    })()
)

test(
  'field callbacks run in parallel before the list callback',
  runner(async ({ context }) => {
    let release: () => void = () => {}
    const secondFieldStarted = new Promise<void>(resolve => {
      release = resolve
    })
    const order: string[] = []
    handlers.fieldCommit = async ({ fieldKey }) => {
      order.push(`start ${fieldKey}`)
      if (fieldKey === 'name') await secondFieldStarted
      else release()
      order.push(`end ${fieldKey}`)
    }
    handlers.commit = () => {
      order.push('list')
    }
    await context.transaction(tx =>
      tx.db.Entry.createOne({ data: { name: 'parallel', other: 'field' } })
    )
    expect(order.slice(0, 2)).toEqual(['start name', 'start other'])
    expect(order.at(-1)).toBe('list')
  })
)

test.each(['afterCommit', 'afterRollback'] as const)(
  'action argument fields cannot define transaction.%s hooks',
  phase => {
    expect(() =>
      createSystem(
        config({
          db: { provider: 'sqlite', prismaClientOptions: () => ({}) },
          lists: {
            Task: list({
              access: allowAll,
              fields: { name: text() },
              actions: {
                rename: action({
                  access: allowAll,
                  args: {
                    name: {
                      graphql: g.arg({ type: g.String }),
                      ui: {
                        source: { field: text({ hooks: { transaction: { [phase]: () => {} } } }) },
                      },
                    },
                  },
                  resolve: async () => null,
                  ui: { label: 'Rename' },
                }),
              },
            }),
          },
        })
      )
    ).toThrow('Task.rename.name cannot define field hooks')
  }
)

test('snapshots preserve database scalar types, cycles and native containers without flattening opaque values', () => {
  const date = new Date('2025-01-01T00:00:00.000Z')
  const decimal = new Decimal('123.45')
  const binary = new Uint8Array([1, 2])
  const promise = Promise.resolve('upload')
  class Opaque {
    value = 'custom scalar'
  }
  const opaque = new Opaque()
  const input: any = {
    date,
    decimal,
    binary,
    large: 123n,
    promise,
    opaque,
    map: new Map([['key', { value: 1 }]]),
    set: new Set([date]),
    sparse: new Array(2),
    regexp: /pattern/gi,
    buffer: Buffer.from([1, 2]),
    dataView: new DataView(new ArrayBuffer(2)),
  }
  input.self = input
  const snapshot = snapshotTransactionValue(input)
  input.date.setUTCFullYear(2030)
  input.binary[0] = 9
  input.map.get('key').value = 2
  expect(snapshot.self).toBe(snapshot)
  expect(snapshot.date.toISOString()).toBe('2025-01-01T00:00:00.000Z')
  expect(snapshot.decimal).toBeInstanceOf(Decimal)
  expect(snapshot.decimal.toString()).toBe('123.45')
  expect(snapshot.decimal).not.toBe(decimal)
  expect(snapshot.binary).toEqual(new Uint8Array([1, 2]))
  expect(snapshot.large).toBe(123n)
  expect(snapshot.map.get('key')).toEqual({ value: 1 })
  expect([...snapshot.set][0].getUTCFullYear()).toBe(2025)
  expect(snapshot.promise).toBe(promise)
  expect(snapshot.opaque).toBe(opaque)
  expect(snapshot.sparse).toHaveLength(2)
  expect(0 in snapshot.sparse).toBe(false)
  expect(snapshot.regexp).toEqual(input.regexp)
  expect(snapshot.regexp).not.toBe(input.regexp)
  expect(snapshot.buffer).toEqual(input.buffer)
  expect(snapshot.buffer).not.toBe(input.buffer)
  expect(snapshot.dataView).toBeInstanceOf(DataView)
  expect(snapshot.dataView.buffer).not.toBe(input.dataView.buffer)
})
