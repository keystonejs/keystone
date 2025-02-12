import { list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'
import { type KeystoneContext } from '@keystone-6/core/types'
import { setupTestSuite } from '@keystone-6/api-tests/test-runner'

function yn (x: boolean) {
  return x ? 'y' : 'n'
}

function makeThrower (suffix: string) {
  return ({ operation }: { operation: string }) => {
    throw new Error(`Throw_${suffix}_${operation}`)
  }
}

function makeList ({
  hooks
}: {
  hooks: {
    resolveInput: boolean
    validate: 'none' | 'throws' | 'validate'
    beforeOperation: boolean
    afterOperation: boolean
    field: boolean
  }
}) {
  const __name = `List_R${yn(hooks.resolveInput)}_V${hooks.validate}_B${yn(hooks.beforeOperation)}_A${yn(hooks.afterOperation)}_F${yn(hooks.field)}` as const
  const makeValidate = (context: string) => {
    return hooks.validate === 'none'
      ? undefined
      : hooks.validate === 'throws'
        ? makeThrower(`${__name}_${context}`)
        : ({ operation, resolvedData, addValidationError }: any) => {
          addValidationError(`Validate_${__name}_${context}_${operation}`)
          // TODO: mixed results
        }
  }

  function replace ({ resolvedData }: { resolvedData: any }) {
    return {
      ...resolvedData,
      basis: resolvedData.basis + 'L'
    }
  }

  function replaceF ({ resolvedData }: { resolvedData: any }) {
    return resolvedData.basis + 'F'
  }

  const N = 10
  const __seeds = {
    update1: { basis: `${__name}_update1S` },
    updateM: [...Array(N)].map((_, i) => ({ basis: `${__name}_update${i + 2}S` })),
    delete1: { basis: `${__name}_delete1S` },
    deleteM: [...Array(N)].map((_, i) => ({ basis: `${__name}_delete${i + 2}S` })),
  } as const

  const __inputs = {
    create1: { basis: `${__name}_create1` },
    createM: [...Array(N)].map((_, i) => ({ basis: `${__name}_create${i + 2}` })),

    update1: { basis: `${__name}_update1` },
    updateM: [...Array(N)].map((_, i) => ({ basis: `${__name}_update${i + 2}` })),
  } as const

  const suffix = hooks.resolveInput ? (hooks.field ? `FL` : `L`) : ''
  const __outputs = {
    create1:  { basis: `${__name}_create1${suffix}` },
    createM:  [...Array(N)].map((_, i) => ({ basis: `${__name}_create${i + 2}${suffix}` })),
    update1:  { basis: `${__name}_update1${suffix}` },
    updateM:  [...Array(N)].map((_, i) => ({ basis: `${__name}_update${i + 2}${suffix}` })),
    delete1: __seeds.delete1, // resolveInput is not relevant
    deleteM: __seeds.deleteM, // resolveInput is not relevant
  } as const

  return {
    __name,
    __seeds,
    __inputs,
    __outputs,
    __hooks: hooks,
    access: allowAll,
    fields: {
      basis: text(hooks.field ? {
        db: { isNullable: true }, // drops the implicit validation hook
        hooks: {
          resolveInput: hooks.resolveInput ? replaceF : undefined,
          validate: {
            create: makeValidate('FVI'),
            update: makeValidate('FVI'),
            delete: makeValidate('FVI'),
          },
          beforeOperation: hooks.beforeOperation ? makeThrower(`${__name}_FBO`) : undefined,
          afterOperation: hooks.afterOperation ? makeThrower(`${__name}_FAO`) : undefined
        }
      } : {}),
    },
    hooks: {
      resolveInput: {
        create: hooks.resolveInput ? replace : undefined,
        update: hooks.resolveInput ? replace : undefined,
      },
      validate: {
        create: makeValidate('VI'),
        update: makeValidate('VI'),
        delete: makeValidate('VI'),
      },
      beforeOperation: {
        create: hooks.beforeOperation ? makeThrower(`${__name}_BO`) : undefined,
        update: hooks.beforeOperation ? makeThrower(`${__name}_BO`) : undefined,
        delete: hooks.beforeOperation ? makeThrower(`${__name}_BO`) : undefined,
      },
      afterOperation: {
        create: hooks.afterOperation ? makeThrower(`${__name}_AO`) : undefined,
        update: hooks.afterOperation ? makeThrower(`${__name}_AO`) : undefined,
        delete: hooks.afterOperation ? makeThrower(`${__name}_AO`) : undefined,
      }
    },
  }
}

const listsMatrix = [...function* () {
  for (const resolveInput of [false, true]) {
    for (const validate of ['none', 'throws', 'validate'] as const) {
      for (const beforeOperation of [false, true]) {
        for (const afterOperation of [false, true]) {
          for (const field of [false, true]) {
            yield makeList({
              hooks: {
                resolveInput,
                validate,
                beforeOperation,
                afterOperation,
                field,
              }
            })
          }
        }
      }
    }
  }
}()]

async function runOperations (context: KeystoneContext, list: ReturnType<typeof makeList>) {
  // we use context.prisma to bypass hooks
  const uitems = await Promise.all(list.__seeds.updateM.map(data => context.prisma[list.__name].create({ data })))
  const ditems = await Promise.all(list.__seeds.deleteM.map(data => context.prisma[list.__name].create({ data })))
  const uitem = await context.prisma[list.__name].create({ data: list.__seeds.update1 })
  const ditem = await context.prisma[list.__name].create({ data: list.__seeds.delete1 })

  const create = context.db[list.__name].createOne({
    data: list.__inputs.create1
  }).catch(e => e.message)

  const createMany = context.db[list.__name].createMany({
    data: list.__inputs.createM
  }).catch(e => e.message)

  const update = context.db[list.__name].updateOne({
    where: {
      id: uitem.id
    },
    data: list.__inputs.update1
  }).catch(e => e.message)

  const updateMany = context.db[list.__name].updateMany({
    data: uitems.map((x, i) => ({
      where: {
        id: x.id
      },
      data: list.__inputs.updateM[i]
    })),
  }).catch(e => e.message)

  const delete_ = context.db[list.__name].deleteOne({
    where: {
      id: ditem.id
    },
  }).catch(e => e.message)

  const deleteMany = context.db[list.__name].deleteMany({
    where: ditems.map((x, i) => ({
      id: x.id
    })),
  }).catch(e => e.message)

  return {
    create,
    createMany,
    update,
    updateMany,
    delete_,
    deleteMany,
    everything: async () => {
      await create
      await createMany
      await update
      await updateMany
      await delete_
      await deleteMany
    }
  }
}

describe(`Hooks`, () => {
  const suite = setupTestSuite({
    config: {
      lists: Object.fromEntries(listsMatrix.map(({ __name, __inputs, ...l }) => [__name, list(l)]))
    }
  })

  for (const list of listsMatrix) {
    describe(`${list.__name}`, () => {
      const d = suite().then(async ({ context }) => await runOperations(context, list))
      const {
        create1,
        createM,
        update1,
        updateM,
        delete1,
        deleteM
      } = list.__outputs

      // field hooks have precedence
      const VI = list.__hooks.field ? 'FVI' : 'VI'
      const BO = list.__hooks.field ? 'FBO' : 'BO'
      const AO = list.__hooks.field ? 'FAO' : 'AO'

      const blocksOperation = list.__hooks.beforeOperation || list.__hooks.validate !== 'none'
      if (blocksOperation) {
        if (list.__hooks.validate !== 'none') {
          if (list.__hooks.validate === 'throws') {
            test.concurrent('createOne throws an error in validate', async () => expect(await (await d).create).toContain(`Throw_${list.__name}_${VI}_create`))
            test.concurrent('createMany throws an error in validate', async () => expect(await (await d).createMany).toContain(`Throw_${list.__name}_${VI}_create`))
            test.concurrent('updateOne throws an error in validate', async () => expect(await (await d).update).toContain(`Throw_${list.__name}_${VI}_update`))
            test.concurrent('updateMany throws an error in validate', async () => expect(await (await d).updateMany).toContain(`Throw_${list.__name}_${VI}_update`))
            test.concurrent('deleteOne throws an error in validate', async () => expect(await (await d).delete_).toContain(`Throw_${list.__name}_${VI}_delete`))
            test.concurrent('deleteMany throws an error in validate', async () => expect(await (await d).deleteMany).toContain(`Throw_${list.__name}_${VI}_delete`))

          // validate errors
          } else {
            test.concurrent('createOne throws a validation error', async () => expect(await (await d).create).toContain(`Validate_${list.__name}_${VI}_create`))
            test.concurrent('createMany throws a validation error', async () => expect(await (await d).createMany).toContain(`Validate_${list.__name}_${VI}_create`))
            test.concurrent('updateOne throws a validation error', async () => expect(await (await d).update).toContain(`Validate_${list.__name}_${VI}_update`))
            test.concurrent('updateMany throws a validation error', async () => expect(await (await d).updateMany).toContain(`Validate_${list.__name}_${VI}_update`))
            test.concurrent('deleteOne throws a validation error', async () => expect(await (await d).delete_).toContain(`Validate_${list.__name}_${VI}_delete`))
            test.concurrent('deleteMany throws a validation error', async () => expect(await (await d).deleteMany).toContain(`Validate_${list.__name}_${VI}_delete`))
          }
        } else {
          test.concurrent('createOne throws an error in beforeOperation', async () => expect(await (await d).create).toContain(`Throw_${list.__name}_${BO}_create`))
          test.concurrent('createMany throws an error in beforeOperation', async () => expect(await (await d).createMany).toContain(`Throw_${list.__name}_${BO}_create`))
          test.concurrent('updateOne throws an error in beforeOperation', async () => expect(await (await d).update).toContain(`Throw_${list.__name}_${BO}_update`))
          test.concurrent('updateMany throws an error in beforeOperation', async () => expect(await (await d).updateMany).toContain(`Throw_${list.__name}_${BO}_update`))
          test.concurrent('deleteOne throws an error in beforeOperation', async () => expect(await (await d).delete_).toContain(`Throw_${list.__name}_${BO}_delete`))
          test.concurrent('deleteMany throws an error in beforeOperation', async () => expect(await (await d).deleteMany).toContain(`Throw_${list.__name}_${BO}_delete`))
        }

        // operation outcome was blocked
        for (const [context, [where, expectedCount]] of Object.entries({
          createOne:  [{ basis: { equals: create1.basis } }, 0] as const,
          createMany: [{ basis: { in: createM.map(x => x.basis) } }, 0] as const,
          updateOne:  [{ basis: { equals: update1.basis } }, 0] as const,
          updateMany: [{ basis: { in: updateM.map(x => x.basis) } }, 0] as const,
          deleteOne:  [{ basis: { equals: delete1.basis } }, 1] as const,
          deleteMany: [{ basis: { in: deleteM.map(x => x.basis) } }, deleteM.length] as const
        })) {
          test.concurrent(`${context} was blocked`, async () => {
            await (await d).everything

            const { context } = await suite()
            const count = await context.db[list.__name].count({ where })

            // everything was created still
            expect(count).toEqual(expectedCount)
          })
        }
      } else {
        if (list.__hooks.afterOperation) {
          test.concurrent('createOne throws an error in afterOperation', async () => expect(await (await d).create).toContain(`Throw_${list.__name}_${AO}_create`))
          test.concurrent('createMany throws an error in afterOperation', async () => expect(await (await d).createMany).toContain(`Throw_${list.__name}_${AO}_create`))
          test.concurrent('updateOne throws an error in afterOperation', async () => expect(await (await d).update).toContain(`Throw_${list.__name}_${AO}_update`))
          test.concurrent('updateMany throws an error in afterOperation', async () => expect(await (await d).updateMany).toContain(`Throw_${list.__name}_${AO}_update`))
          test.concurrent('deleteOne throws an error in afterOperation', async () => expect(await (await d).delete_).toContain(`Throw_${list.__name}_${AO}_delete`))
          test.concurrent('deleteMany throws an error in afterOperation', async () => expect(await (await d).deleteMany).toContain(`Throw_${list.__name}_${AO}_delete`))

        } else {
          test.concurrent('createOne resolved the expected values', async () => expect(await (await d).create).toEqual(expect.objectContaining(create1)))
          test.concurrent('createMany resolved the expected values', async () => expect(await (await d).createMany).toEqual(expect.arrayContaining(createM.map(x => expect.objectContaining(x)))))
          test.concurrent('updateOne resolved the expected values', async () => expect(await (await d).update).toEqual(expect.objectContaining(update1)))
          test.concurrent('updateMany resolved the expected values', async () => expect(await (await d).updateMany).toEqual(expect.arrayContaining(updateM.map(x => expect.objectContaining(x)))))
          test.concurrent('deleteOne resolved the expected values', async () => expect(await (await d).delete_).toEqual(expect.objectContaining(delete1)))
          test.concurrent('deleteMany resolved the expected values', async () => expect(await (await d).deleteMany).toEqual(expect.arrayContaining(deleteM.map(x => expect.objectContaining(x)))))
        }

        // operation outcome was successful
        for (const [context, [where, expectedCount]] of Object.entries({
          createOne:  [{ basis: { equals: create1.basis } }, 1] as const,
          createMany: [{ basis: { in: createM.map(x => x.basis) } }, createM.length] as const,
          updateOne:  [{ basis: { equals: update1.basis } }, 1] as const,
          updateMany: [{ basis: { in: updateM.map(x => x.basis) } }, updateM.length] as const,
          deleteOne:  [{ basis: { equals: delete1.basis } }, 0] as const,
          deleteMany: [{ basis: { in: deleteM.map(x => x.basis) } }, 0] as const
        })) {
          test.concurrent(`${context} was successful`, async () => {
            await (await d).everything

            const { context } = await suite()
            const count = await context.db[list.__name].count({ where })

            // everything was created still
            expect(count).toEqual(expectedCount)
          })
        }
      }
    })
  }
})
