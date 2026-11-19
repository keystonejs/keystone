import { describe, expect, test } from 'vitest'
import { gen, sampleOne } from 'testcheck'
import { text, relationship } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import type { ContextFromRunner } from '../utils.ts'
import { mutation, query } from '../run-field.ts'

const alphanumGenerator = gen.alphaNumString.notEmpty()

type IdType = any

const createInitialData = async (context: ContextFromRunner<typeof runner>) => {
  const companies = (await context.db.Company.createMany({
    data: [
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
    ],
    select: { id: true },
  })) as { id: IdType }[]
  const locations = (await context.db.Location.createMany({
    data: [
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
    ],
    select: { id: true },
  })) as { id: IdType }[]
  const owners = await context.db.Owner.createMany({
    data: companies.map(({ id }) => ({ name: `Owner_of_${id}`, companies: { connect: [{ id }] } })),
    select: { id: true },
  })
  const custodians = await context.db.Custodian.createMany({
    data: locations.map(({ id }) => ({
      name: `Custodian_of_${id}`,
      locations: { connect: [{ id }] },
    })),
    select: { id: true },
  })
  return { locations, companies, owners, custodians }
}

const createCompanyAndLocation = async (context: ContextFromRunner<typeof runner>) => {
  const [cu1, cu2] = await context.db.Custodian.createMany({
    data: [{ name: sampleOne(alphanumGenerator) }, { name: sampleOne(alphanumGenerator) }],
    select: { id: true },
  })

  return mutation(context).createOwner<{
    id: string
    name: string | null
    companies: {
      id: string
      name: string | null
      location: {
        id: string
        name: string | null
        custodians: { id: string; name: string | null }[]
      }
    }[]
  }>({
    data: {
      name: sampleOne(alphanumGenerator),
      companies: {
        create: [
          {
            name: sampleOne(alphanumGenerator),
            location: {
              create: {
                name: sampleOne(alphanumGenerator),
                custodians: { connect: [{ id: cu1.id }] },
              },
            },
          },
          {
            name: sampleOne(alphanumGenerator),
            location: {
              create: {
                name: sampleOne(alphanumGenerator),
                custodians: { connect: [{ id: cu1.id }] },
              },
            },
          },
          {
            name: sampleOne(alphanumGenerator),
            location: {
              create: {
                name: sampleOne(alphanumGenerator),
                custodians: { connect: [{ id: cu2.id }] },
              },
            },
          },
        ],
      },
    },
    query: 'id name companies { id name location { id name custodians { id name } } }',
  })
}

const runner = setupTestRunner({
  config: {
    lists: {
      Owner: list({
        access: allowAll,
        fields: {
          name: text(),
          companies: relationship({ ref: 'Company.owners', many: true }),
        },
      }),
      Company: list({
        access: allowAll,
        fields: {
          name: text(),
          location: relationship({ ref: 'Location.company' }),
          owners: relationship({ ref: 'Owner.companies', many: true }),
        },
      }),
      Location: list({
        access: allowAll,
        fields: {
          name: text(),
          company: relationship({ ref: 'Company.location' }),
          custodians: relationship({ ref: 'Custodian.locations', many: true }),
        },
      }),
      Custodian: list({
        access: allowAll,
        fields: {
          name: text(),
          locations: relationship({ ref: 'Location.custodians', many: true }),
        },
      }),
    },
  },
})

describe(`One-to-one relationships`, () => {
  describe('Read', () => {
    test(
      'Where A',
      runner(async ({ context }) => {
        await createInitialData(context)
        const owner = await createCompanyAndLocation(context)
        const name1 = owner.companies[0].location.custodians[0].name
        const owners = await query(context).owners<
          { id: string; companies: { location: { custodians: { name: string | null }[] } }[] }[]
        >({
          where: {
            companies: {
              some: { location: { custodians: { some: { name: { equals: name1 } } } } },
            },
          },
          query: 'id companies { location { custodians { name } } }',
        })
        expect(owners.length).toEqual(1)
        expect(owners[0].id).toEqual(owner.id)
      })
    )
    test(
      'Where B',
      runner(async ({ context }) => {
        await createInitialData(context)
        const owner = await createCompanyAndLocation(context)
        const name1 = owner.name
        const custodians = await query(context).custodians<
          { id: string; locations: { company: { owners: { name: string | null }[] } }[] }[]
        >({
          where: {
            locations: { some: { company: { owners: { some: { name: { equals: name1 } } } } } },
          },
          query: 'id locations { company { owners { name } } }',
        })
        expect(custodians.length).toEqual(2)
      })
    )
    test(
      'Where C',
      runner(async ({ context }) => {
        await createInitialData(context)
        const owner = await createCompanyAndLocation(context)
        const name1 = owner.name
        const owners = await query(context).owners<
          { id: string; companies: { location: { custodians: { name: string | null }[] } }[] }[]
        >({
          where: {
            companies: {
              some: {
                location: {
                  custodians: {
                    some: {
                      locations: {
                        some: { company: { owners: { some: { name: { equals: name1 } } } } },
                      },
                    },
                  },
                },
              },
            },
          },
          query: 'id companies { location { custodians { name } } }',
        })
        expect(owners.length).toEqual(1)
        expect(owners[0].id).toEqual(owner.id)
      })
    )
    test(
      'Where D',
      runner(async ({ context }) => {
        await createInitialData(context)
        const owner = await createCompanyAndLocation(context)
        const name1 = owner.companies[0].location.custodians[0].name

        const custodians = await query(context).custodians<
          { id: string; locations: { company: { owners: { name: string | null }[] } }[] }[]
        >({
          where: {
            locations: {
              some: {
                company: {
                  owners: {
                    some: {
                      companies: {
                        some: { location: { custodians: { some: { name: { equals: name1 } } } } },
                      },
                    },
                  },
                },
              },
            },
          },
          query: 'id locations { company { owners { name } } }',
        })
        expect(custodians.length).toEqual(2)
      })
    )
  })
})
