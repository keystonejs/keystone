import { list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'
import { type KeystoneContext } from '@keystone-6/core/types'
import { setupTestSuite } from '@keystone-6/api-tests/test-runner'

function yn (x: boolean) {
  return x ? 'y' : 'n'
}

function makeThrower (suffix: string) {
  return () => {
    throw new Error(`Throw_${suffix}`)
  }
}

function makeList ({
  hooks
}: {
  hooks: {
    resolveInput: boolean,
    validate: 'none' | 'throws' | 'validate',
    beforeOperation: boolean,
    afterOperation: boolean
  }
}) {
  const __name = `List_R${yn(hooks.resolveInput)}_V${hooks.validate}_B${yn(hooks.beforeOperation)}_A${yn(hooks.afterOperation)}` as const
  const makeValidate = (context: string) => {
    return hooks.validate === 'none'
      ? undefined
      : hooks.validate === 'throws'
        ? makeThrower(`${__name}_${context}`)
        : ({ resolvedData, addValidationError }: any) => {
          addValidationError(`Validate_${__name}_${context}`)
          // TODO: mixed results
        }
  }

  function replace ({ inputData }: { inputData: any }) {
    if (inputData?.basis.match(/(_create|update)/)) {
      return {
        ...inputData,
        basis: inputData.basis
          .replace('_create', '_createR')
          .replace('_update', '_updateR')
      }
    }
    throw new Error(`${inputData?.basis} not replaced`)
  }

  const N = 10
  const __inputs = {
    create1:  { basis: `${__name}_create1` },
    create1R: { basis: `${__name}_createR1` },
    createM: [...Array(N)].map((_, i) => ({ basis: `${__name}_create${i + 2}` })),
    createMR: [...Array(N)].map((_, i) => ({ basis: `${__name}_createR${i + 2}` })),

    update1S: { basis: `${__name}_updateS1` }, // seed
    update1: { basis: `${__name}_update1` },
    update1R: { basis: `${__name}_updateR1` },
    updateMS: [...Array(N)].map((_, i) => ({ basis: `${__name}_updateS${i + 2}` })), // seed
    updateM: [...Array(N)].map((_, i) => ({ basis: `${__name}_update${i + 2}` })),
    updateMR: [...Array(N)].map((_, i) => ({ basis: `${__name}_updateR${i + 2}` })),

    delete1S: { basis: `${__name}_deleteS1` }, // seed
    deleteMS: [...Array(N)].map((_, i) => ({ basis: `${__name}_deleteS${i + 2}` })), // seed
  } as const

  return {
    __name,
    __inputs,
    __hooks: hooks,
    access: allowAll,
    fields: {
      basis: text(),
    },
    hooks: {
      resolveInput: {
        create: hooks.resolveInput ? replace : undefined,
        update: hooks.resolveInput ? replace : undefined,
      },
      validate: {
        create: makeValidate('VI_create'),
        update: makeValidate('VI_update'),
        delete: makeValidate('VI_delete'),
      },
      beforeOperation: {
        create: hooks.beforeOperation ? makeThrower(`${__name}_BO_create`) : undefined,
        update: hooks.beforeOperation ? makeThrower(`${__name}_BO_update`) : undefined,
        delete: hooks.beforeOperation ? makeThrower(`${__name}_BO_delete`) : undefined,
      },
      afterOperation: {
        create: hooks.afterOperation ? makeThrower(`${__name}_AO_create`) : undefined,
        update: hooks.afterOperation ? makeThrower(`${__name}_AO_update`) : undefined,
        delete: hooks.afterOperation ? makeThrower(`${__name}_AO_delete`) : undefined,
      }
    },
  }
}

const listsMatrix = [...function* () {
  for (const resolveInput of [false, true]) {
    for (const validate of ['none', 'throws', 'validate'] as const) {
      for (const beforeOperation of [false, true]) {
        for (const afterOperation of [false, true]) {
          yield makeList({
            hooks: {
              resolveInput,
              validate,
              beforeOperation,
              afterOperation
            }
          })
        }
      }
    }
  }
}()]

async function runOperations (context: KeystoneContext, list: ReturnType<typeof makeList>) {
  // we use context.prisma to bypass hooks
  const uitems = await Promise.all(list.__inputs.updateMS.map(u => context.prisma[list.__name].create({ data: u })))
  const ditems = await Promise.all(list.__inputs.deleteMS.map(u => context.prisma[list.__name].create({ data: u })))
  const uitem = await context.prisma[list.__name].create({ data: list.__inputs.update1S })
  const ditem = await context.prisma[list.__name].create({ data: list.__inputs.delete1S })

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

      const create1T = list.__hooks.resolveInput ? list.__inputs.create1R : list.__inputs.create1
      const createMT = list.__hooks.resolveInput ? list.__inputs.createMR : list.__inputs.createM
      const update1T = list.__hooks.resolveInput ? list.__inputs.update1R : list.__inputs.update1
      const updateMT = list.__hooks.resolveInput ? list.__inputs.updateMR : list.__inputs.updateM
      const delete1T = list.__inputs.delete1S // resolveInput is not relevant
      const deleteMT = list.__inputs.deleteMS // resolveInput is not relevant

      const blocksOperation = list.__hooks.beforeOperation || list.__hooks.validate !== 'none'
      if (blocksOperation) {
        describe('operation is blocked when', () => {
          if (list.__hooks.validate !== 'none') {
            if (list.__hooks.validate === 'throws') {
              test.concurrent('create1 throws an error in validate', async () => expect(await (await d).create).toContain(`Throw_${list.__name}_VI_create`))
              test.concurrent('createMany throws an error in validate', async () => expect(await (await d).createMany).toContain(`Throw_${list.__name}_VI_create`))
              test.concurrent('update1 throws an error in validate', async () => expect(await (await d).update).toContain(`Throw_${list.__name}_VI_update`))
              test.concurrent('updateMany throws an error in validate', async () => expect(await (await d).updateMany).toContain(`Throw_${list.__name}_VI_update`))
              test.concurrent('delete1 throws an error in validate', async () => expect(await (await d).delete_).toContain(`Throw_${list.__name}_VI_delete`))
              test.concurrent('deleteMany throws an error in validate', async () => expect(await (await d).deleteMany).toContain(`Throw_${list.__name}_VI_delete`))

            // validate errors
            } else {
              test.concurrent('create1 throws a validation error', async () => expect(await (await d).create).toContain(`Validate_${list.__name}_VI_create`))
              test.concurrent('createMany throws a validation error', async () => expect(await (await d).createMany).toContain(`Validate_${list.__name}_VI_create`))
              test.concurrent('update1 throws a validation error', async () => expect(await (await d).update).toContain(`Validate_${list.__name}_VI_update`))
              test.concurrent('updateMany throws a validation error', async () => expect(await (await d).updateMany).toContain(`Validate_${list.__name}_VI_update`))
              test.concurrent('delete1 throws a validation error', async () => expect(await (await d).delete_).toContain(`Validate_${list.__name}_VI_delete`))
              test.concurrent('deleteMany throws a validation error', async () => expect(await (await d).deleteMany).toContain(`Validate_${list.__name}_VI_delete`))
            }
          } else {
            test.concurrent('create1 throws an error in beforeOperation', async () => expect(await (await d).create).toContain(`Throw_${list.__name}_BO_create`))
            test.concurrent('createMany throws an error in beforeOperation', async () => expect(await (await d).createMany).toContain(`Throw_${list.__name}_BO_create`))
            test.concurrent('update1 throws an error in beforeOperation', async () => expect(await (await d).update).toContain(`Throw_${list.__name}_BO_update`))
            test.concurrent('updateMany throws an error in beforeOperation', async () => expect(await (await d).updateMany).toContain(`Throw_${list.__name}_BO_update`))
            test.concurrent('delete1 throws an error in beforeOperation', async () => expect(await (await d).delete_).toContain(`Throw_${list.__name}_BO_delete`))
            test.concurrent('deleteMany throws an error in beforeOperation', async () => expect(await (await d).deleteMany).toContain(`Throw_${list.__name}_BO_delete`))
          }

          // operation outcome was blocked
          for (const [context, [where, expectedCount]] of Object.entries({
            create1: [{ basis: { equals: create1T.basis } }, 0] as const,
            createM: [{ basis: { in: createMT.map(x => x.basis) } }, 0] as const,
            update1: [{ basis: { equals: update1T.basis } }, 0] as const,
            updateM: [{ basis: { in: updateMT.map(x => x.basis) } }, 0] as const,
            delete1: [{ basis: { equals: delete1T.basis } }, 1] as const,
            deleteM: [{ basis: { in: deleteMT.map(x => x.basis) } }, deleteMT.length] as const
          })) {
            test.concurrent(`${context} was blocked`, async () => {
              await (await d).everything

              const { context } = await suite()
              const count = await context.db[list.__name].count({ where })

              // everything was created still
              expect(count).toEqual(expectedCount)
            })
          }
        })
      } else {
        describe('operation is successful when', () => {
          if (list.__hooks.afterOperation) {
            test.concurrent('create1 throws an error in afterOperation', async () => expect(await (await d).create).toContain(`Throw_${list.__name}_AO_create`))
            test.concurrent('createMany throws an error in afterOperation', async () => expect(await (await d).createMany).toContain(`Throw_${list.__name}_AO_create`))
            test.concurrent('update1 throws an error in afterOperation', async () => expect(await (await d).update).toContain(`Throw_${list.__name}_AO_update`))
            test.concurrent('updateMany throws an error in afterOperation', async () => expect(await (await d).updateMany).toContain(`Throw_${list.__name}_AO_update`))
            test.concurrent('delete1 throws an error in afterOperation', async () => expect(await (await d).delete_).toContain(`Throw_${list.__name}_AO_delete`))
            test.concurrent('deleteMany throws an error in afterOperation', async () => expect(await (await d).deleteMany).toContain(`Throw_${list.__name}_AO_delete`))

          } else {
            test.concurrent('create1 resolved the expected values', async () => expect(await (await d).create).toEqual(expect.objectContaining(create1T)))
            test.concurrent('createMany resolved the expected values', async () => expect(await (await d).createMany).toEqual(expect.arrayContaining(createMT.map(x => expect.objectContaining(x)))))
            test.concurrent('update1 resolved the expected values', async () => expect(await (await d).update).toEqual(expect.objectContaining(update1T)))
            test.concurrent('updateMany resolved the expected values', async () => expect(await (await d).updateMany).toEqual(expect.arrayContaining(updateMT.map(x => expect.objectContaining(x)))))
            test.concurrent('delete1 resolved the expected values', async () => expect(await (await d).delete_).toEqual(expect.objectContaining(delete1T)))
            test.concurrent('deleteMany resolved the expected values', async () => expect(await (await d).deleteMany).toEqual(expect.arrayContaining(deleteMT.map(x => expect.objectContaining(x)))))
          }

          // operation outcome was successful
          for (const [context, [where, expectedCount]] of Object.entries({
            create1: [{ basis: { equals: create1T.basis } }, 1] as const,
            createM: [{ basis: { in: createMT.map(x => x.basis) } }, createMT.length] as const,
            update1: [{ basis: { equals: update1T.basis } }, 1] as const,
            updateM: [{ basis: { in: updateMT.map(x => x.basis) } }, updateMT.length] as const,
            delete1: [{ basis: { equals: delete1T.basis } }, 0] as const,
            deleteM: [{ basis: { in: deleteMT.map(x => x.basis) } }, 0] as const
          })) {
            test.concurrent(`${context} was successful`, async () => {
              await (await d).everything

              const { context } = await suite()
              const count = await context.db[list.__name].count({ where })

              // everything was created still
              expect(count).toEqual(expectedCount)
            })
          }
        })
      }
    })
  }
})
