import { describe, expect, test } from 'vitest'
import { gen, sampleOne } from 'testcheck'
import { text, relationship } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import type { KeystoneContext } from '@keystone-6/core/types'
import { allowAll } from '@keystone-6/core/access'
import type { ContextFromRunner } from '../../utils.ts'
import { mutation, query } from '../../run-field.ts'

type IdType = any

const alphanumGenerator = gen.alphaNumString.notEmpty()

const createInitialData = async (context: ContextFromRunner<typeof runner>) => {
  const companies = await context.db.Company.createMany({
    data: [
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
    ],
    select: { id: true },
  })
  const locations = await context.db.Location.createMany({
    data: [
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
      { name: sampleOne(alphanumGenerator) },
    ],
    select: { id: true },
  })
  return { locations, companies }
}

const createCompanyAndLocation = async (context: ContextFromRunner<typeof runner>) => {
  const company = await mutation(context).createCompany<{
    id: string
    name: string | null
    location: { id: string; name: string | null; company: { id: string } }
  }>({
    data: {
      name: sampleOne(alphanumGenerator),
      location: { create: { name: sampleOne(alphanumGenerator) } },
    },
    query: 'id name location { id name company { id } }',
  })
  const { Company, Location } = await getCompanyAndLocation(
    context,
    company.id,
    company.location.id
  )

  // Sanity check the links are setup correctly
  expect(Company.location.id.toString()).toBe(Location.id.toString())
  expect(Location.company.id.toString()).toBe(Company.id.toString())

  return { company, location: company.location }
}

const createLocationAndCompany = async (context: ContextFromRunner<typeof runner>) => {
  const location = await mutation(context).createLocation<{
    id: string
    name: string | null
    company: { id: string; name: string | null; location: { id: string } }
  }>({
    data: {
      name: sampleOne(alphanumGenerator),
      company: { create: { name: sampleOne(alphanumGenerator) } },
    },
    query: 'id name company { id name location { id } }',
  })
  const { Company, Location } = await getCompanyAndLocation(
    context,
    location.company.id,
    location.id
  )

  // Sanity check the links are setup correctly
  expect(Company.location.id.toString()).toBe(Location.id.toString())
  expect(Location.company.id.toString()).toBe(Company.id.toString())

  return { location, company: location.company }
}

const getCompanyAndLocation = async (
  context: KeystoneContext,
  companyId: IdType,
  locationId: IdType
) => {
  type T = {
    data: {
      Company: { id: IdType; location: { id: IdType } }
      Location: { id: IdType; company: { id: IdType } }
    }
  }
  const { data } = (await context.graphql.raw({
    query: `
  {
    Company: company(where: { id: "${companyId}"} ) { id location { id } }
    Location: location(where: { id: "${locationId}"} ) { id company { id } }
  }`,
  })) as T
  return data
}

const runner = setupTestRunner({
  config: {
    lists: {
      Company: list({
        access: allowAll,
        fields: {
          name: text(),
          location: relationship({ ref: 'Location.company' }),
        },
      }),
      Location: list({
        access: allowAll,
        fields: {
          name: text(),
          company: relationship({ ref: 'Company.location' }),
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
        const { location, company } = await createCompanyAndLocation(context)
        const locations = await query(context).locations<{ id: string }[]>({
          where: { company: { name: { equals: company.name } } },
          query: 'id',
        })
        const companies = await query(context).companies<{ id: string }[]>({
          where: { location: { name: { equals: location.name } } },
          query: 'id',
        })
        expect(locations.length).toEqual(1)
        expect(locations[0].id).toEqual(location.id)
        expect(companies.length).toEqual(1)
        expect(companies[0].id).toEqual(company.id)
      })
    )
    test(
      'Where B',
      runner(async ({ context }) => {
        await createInitialData(context)
        const { location, company } = await createLocationAndCompany(context)
        const locations = await query(context).locations<{ id: string }[]>({
          where: { company: { name: { equals: company.name } } },
          query: 'id',
        })
        const companies = await query(context).companies<{ id: string }[]>({
          where: { location: { name: { equals: location.name } } },
          query: 'id',
        })
        expect(locations.length).toEqual(1)
        expect(locations[0].id).toEqual(location.id)
        expect(companies.length).toEqual(1)
        expect(companies[0].id).toEqual(company.id)
      })
    )
    test(
      'Where A: is null',
      runner(async ({ context }) => {
        await createInitialData(context)
        await createCompanyAndLocation(context)
        const locations = await query(context).locations<{ id: string }[]>({
          where: { company: null },
          query: 'id',
        })
        const companies = await query(context).companies<{ id: string }[]>({
          where: { location: null },
          query: 'id',
        })
        expect(locations.length).toEqual(4)
        expect(companies.length).toEqual(3)
      })
    )
    test(
      'Where B: is null',
      runner(async ({ context }) => {
        await createInitialData(context)
        await createLocationAndCompany(context)
        const locations = await query(context).locations<{ id: string }[]>({
          where: { company: null },
          query: 'id',
        })
        const companies = await query(context).companies<{ id: string }[]>({
          where: { location: null },
          query: 'id',
        })
        expect(locations.length).toEqual(4)
        expect(companies.length).toEqual(3)
      })
    )
    test(
      'Where A: is not null',
      runner(async ({ context }) => {
        await createInitialData(context)
        await createCompanyAndLocation(context)
        const locations = await query(context).locations<{ id: string }[]>({
          where: { NOT: { company: null } },
          query: 'id',
        })
        const companies = await query(context).companies<{ id: string }[]>({
          where: { NOT: { location: null } },
          query: 'id',
        })
        expect(locations.length).toEqual(1)
        expect(companies.length).toEqual(1)
      })
    )
    test(
      'Where B: is not null',
      runner(async ({ context }) => {
        await createInitialData(context)
        await createLocationAndCompany(context)
        const locations = await query(context).locations<{ id: string }[]>({
          where: { NOT: { company: null } },
          query: 'id',
        })
        const companies = await query(context).companies<{ id: string }[]>({
          where: { NOT: { location: null } },
          query: 'id',
        })
        expect(locations.length).toEqual(1)
        expect(companies.length).toEqual(1)
      })
    )

    test(
      'Count',
      runner(async ({ context }) => {
        await createInitialData(context)
        const companiesCount = await query(context).companiesCount()
        const locationsCount = await query(context).locationsCount()
        expect(companiesCount).toEqual(3)
        expect(locationsCount).toEqual(4)
      })
    )

    test(
      'Where with count A',
      runner(async ({ context }) => {
        await createInitialData(context)
        const { location, company } = await createCompanyAndLocation(context)
        const locationsCount = await query(context).locationsCount({
          where: { company: { name: { equals: company.name } } },
        })
        const companiesCount = await query(context).companiesCount({
          where: { location: { name: { equals: location.name } } },
        })
        expect(companiesCount).toEqual(1)
        expect(locationsCount).toEqual(1)
      })
    )
    test(
      'Where with count B',
      runner(async ({ context }) => {
        await createInitialData(context)
        const { location, company } = await createLocationAndCompany(context)
        const locationsCount = await query(context).locationsCount({
          where: { company: { name: { equals: company.name } } },
        })
        const companiesCount = await query(context).companiesCount({
          where: { location: { name: { equals: location.name } } },
        })
        expect(companiesCount).toEqual(1)
        expect(locationsCount).toEqual(1)
      })
    )
    test(
      'Where null with count A',
      runner(async ({ context }) => {
        await createInitialData(context)
        await createCompanyAndLocation(context)
        const locationsCount = await query(context).locationsCount({
          where: { company: null },
        })
        const companiesCount = await query(context).companiesCount({
          where: { location: null },
        })
        expect(companiesCount).toEqual(3)
        expect(locationsCount).toEqual(4)
      })
    )
    test(
      'Where null with count B',
      runner(async ({ context }) => {
        await createInitialData(context)
        await createLocationAndCompany(context)
        const locationsCount = await query(context).locationsCount({
          where: { company: null },
        })
        const companiesCount = await query(context).companiesCount({
          where: { location: null },
        })
        expect(companiesCount).toEqual(3)
        expect(locationsCount).toEqual(4)
      })
    )
  })

  describe('Create', () => {
    test(
      'With connect A',
      runner(async ({ context }) => {
        const { locations } = await createInitialData(context)
        const location = locations[0]
        const company = await mutation(context).createCompany<{
          id: string
          location: { id: string }
        }>({
          data: { location: { connect: { id: location.id } } },
          query: 'id location { id }',
        })
        expect(company.location.id.toString()).toEqual(location.id)

        const { Company, Location } = await getCompanyAndLocation(context, company.id, location.id)
        // Everything should now be connected
        expect(Company.location.id.toString()).toBe(Location.id.toString())
        expect(Location.company.id.toString()).toBe(Company.id.toString())
      })
    )

    test(
      'With connect B',
      runner(async ({ context }) => {
        const { companies } = await createInitialData(context)
        const company = companies[0]
        const location = await mutation(context).createLocation<{
          id: string
          company: { id: string }
        }>({
          data: { company: { connect: { id: company.id } } },
          query: 'id company { id }',
        })
        expect(location.company.id.toString()).toEqual(company.id)

        const { Company, Location } = await getCompanyAndLocation(context, company.id, location.id)
        // Everything should now be connected
        expect(Company.location.id.toString()).toBe(Location.id.toString())
        expect(Location.company.id.toString()).toBe(Company.id.toString())
      })
    )

    test(
      'With create A',
      runner(async ({ context }) => {
        const locationName = sampleOne(alphanumGenerator)
        const company = await mutation(context).createCompany<{
          id: string
          location: { id: string }
        }>({
          data: { location: { create: { name: locationName } } },
          query: 'id location { id }',
        })

        const { Company, Location } = await getCompanyAndLocation(
          context,
          company.id,
          company.location.id
        )

        // Everything should now be connected
        expect(Company.location.id.toString()).toBe(Location.id.toString())
        expect(Location.company.id.toString()).toBe(Company.id.toString())
      })
    )

    test(
      'With create B',
      runner(async ({ context }) => {
        const companyName = sampleOne(alphanumGenerator)
        const location = await mutation(context).createLocation<{
          id: string
          company: { id: string }
        }>({
          data: { company: { create: { name: companyName } } },
          query: 'id company { id }',
        })

        const { Company, Location } = await getCompanyAndLocation(
          context,
          location.company.id,
          location.id
        )

        // Everything should now be connected
        expect(Company.location.id.toString()).toBe(Location.id.toString())
        expect(Location.company.id.toString()).toBe(Company.id.toString())
      })
    )

    test(
      'With nested connect A',
      runner(async ({ context }) => {
        const { companies } = await createInitialData(context)
        const company = companies[0]
        const locationName = sampleOne(alphanumGenerator)

        const _company = await mutation(context).createCompany<{
          id: string
          location: { id: string; company: { id: string } }
        }>({
          data: {
            location: {
              create: { name: locationName, company: { connect: { id: company.id } } },
            },
          },
          query: 'id location { id company { id } }',
        })
        const { Company, Location } = await getCompanyAndLocation(
          context,
          _company.id,
          _company.location.id
        )
        // Everything should now be connected
        expect(Company.location.id.toString()).toBe(Location.id.toString())
        expect(Location.company.id.toString()).toBe(Company.id.toString())

        const _companies = await query(context).companies<
          { id: string; location: { id: string; company: { id: string } } }[]
        >({ query: 'id location { id company { id } }' })
        // The nested company should not have a location
        expect(_companies.filter(({ id }) => id === Company.id)[0].location.company.id).toEqual(
          Company.id
        )
        _companies
          .filter(({ id }) => id !== Company.id)
          .forEach(company => {
            expect(company.location).toBe(null)
          })
      })
    )

    test(
      'With nested connect B',
      runner(async ({ context }) => {
        const { locations } = await createInitialData(context)
        const location = locations[0]
        const companyName = sampleOne(alphanumGenerator)

        const _location = await mutation(context).createLocation<{
          id: string
          company: { id: string; location: { id: string } }
        }>({
          data: {
            company: {
              create: { name: companyName, location: { connect: { id: location.id } } },
            },
          },
          query: 'id company { id location { id } }',
        })
        const { Company, Location } = await getCompanyAndLocation(
          context,
          _location.company.id,
          _location.id
        )
        // Everything should now be connected
        expect(Company.location.id.toString()).toBe(Location.id.toString())
        expect(Location.company.id.toString()).toBe(Company.id.toString())

        const allLocations = await query(context).locations<
          { id: string; company: { id: string; location: { id: string } } }[]
        >({ query: 'id company { id location { id } }' })
        // The nested company should not have a location
        expect(allLocations.filter(({ id }) => id === Location.id)[0].company.location.id).toEqual(
          Location.id
        )
        allLocations
          .filter(({ id }) => id !== Location.id)
          .forEach(location => {
            expect(location.company).toBe(null)
          })
      })
    )

    test(
      'With nested create',
      runner(async ({ context }) => {
        const locationName = sampleOne(alphanumGenerator)
        const companyName = sampleOne(alphanumGenerator)

        const company = await mutation(context).createCompany<{
          id: string
          location: { id: string; company: { id: string } }
        }>({
          data: {
            location: {
              create: { name: locationName, company: { create: { name: companyName } } },
            },
          },
          query: 'id location { id company { id } }',
        })

        const { Company, Location } = await getCompanyAndLocation(
          context,
          company.id,
          company.location.id
        )
        // Everything should now be connected
        expect(Company.location.id.toString()).toBe(Location.id.toString())
        expect(Location.company.id.toString()).toBe(Company.id.toString())

        // The nested company should not have a location
        const companies = await query(context).companies<
          { id: string; location: { id: string; company: { id: string } } }[]
        >({ query: 'id location { id company { id } }' })
        expect(companies.filter(({ id }) => id === Company.id)[0].location.company.id).toEqual(
          Company.id
        )
        companies
          .filter(({ id }) => id !== Company.id)
          .forEach(company => {
            expect(company.location).toBe(null)
          })
      })
    )
    test(
      'Dual create A',
      runner(async ({ context }) => {
        // Create a Location
        const location = await context.db.Location.createOne({
          data: { name: sampleOne(alphanumGenerator) },
          select: { id: true },
        })

        // Create a Company pointing to Location
        const company1 = await mutation(context).createCompany<{
          id: string
          location: { id: string }
        }>({
          data: {
            name: sampleOne(alphanumGenerator),
            location: { connect: { id: location.id } },
          },
          query: 'id location { id }',
        })

        // Create another Company pointing to Location
        const company2 = await mutation(context).createCompany<{
          id: string
          location: { id: string }
        }>({
          data: {
            name: sampleOne(alphanumGenerator),
            location: { connect: { id: location.id } },
          },
          query: 'id location { id }',
        })

        // Make sure the original Company does not point to the location
        const result = await query(context).locations({ query: 'id name company { id }' })
        expect(result).toHaveLength(1)

        const result1 = await query(context).company<{ id: string; location: { id: string } }>({
          where: { id: company1.id },
          query: 'id location { id }',
        })
        expect(result1?.location).toBe(null)

        const result2 = await query(context).company<{ id: string; location: { id: string } }>({
          where: { id: company2.id },
          query: 'id location { id }',
        })
        expect(result2?.location).toEqual({ id: location.id })
      })
    )
    test(
      'Dual create B',
      runner(async ({ context }) => {
        // Create a Company
        const company = await context.db.Company.createOne({
          data: { name: sampleOne(alphanumGenerator) },
          select: { id: true },
        })

        // Create a Location pointing to Company
        const location1 = await mutation(context).createLocation<{
          id: string
          company: { id: string }
        }>({
          data: {
            name: sampleOne(alphanumGenerator),
            company: { connect: { id: company.id } },
          },
          query: 'id company { id }',
        })

        // Create another Location pointing to Company
        const location2 = await mutation(context).createLocation<{
          id: string
          company: { id: string }
        }>({
          data: {
            name: sampleOne(alphanumGenerator),
            company: { connect: { id: company.id } },
          },
          query: 'id company { id }',
        })

        // Make sure the original Company does not point to the location
        const result = await query(context).companies({ query: 'id location { id }' })
        expect(result).toHaveLength(1)

        const result1 = await query(context).location<{ id: string; company: { id: string } }>({
          where: { id: location1.id },
          query: 'id company { id }',
        })
        expect(result1?.company).toBe(null)

        const result2 = await query(context).location<{ id: string; company: { id: string } }>({
          where: { id: location2.id },
          query: 'id company { id }',
        })
        expect(result2?.company).toEqual({ id: company.id })
      })
    )

    test(
      'With null A',
      runner(async ({ context }) => {
        const company = await mutation(context).createCompany<{
          id: string
          location: { id: string }
        }>({
          data: { location: null },
          query: 'id location { id }',
        })

        // Location should be empty
        expect(company.location).toBe(null)
      })
    )

    test(
      'With null B',
      runner(async ({ context }) => {
        const location = await mutation(context).createLocation<{
          id: string
          company: { id: string }
        }>({
          data: { company: null },
          query: 'id company { id }',
        })
        // Company should be empty
        expect(location.company).toBe(null)
      })
    )
  })

  describe('Update', () => {
    test(
      'With connect A',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { location, company } = await createCompanyAndLocation(context)

        // Sanity check the links don't yet exist
        // `...not.toBe(expect.anything())` allows null and undefined values
        expect(company.location).not.toBe(expect.anything())
        expect(location.company).not.toBe(expect.anything())

        await mutation(context).updateCompany({
          where: { id: company.id },
          data: { location: { connect: { id: location.id } } },
          query: 'id location { id }',
        })

        const { Company, Location } = await getCompanyAndLocation(context, company.id, location.id)
        // Everything should now be connected
        expect(Company.location.id.toString()).toBe(Location.id.toString())
        expect(Location.company.id.toString()).toBe(Company.id.toString())
      })
    )

    test(
      'With connect B',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { location, company } = await createLocationAndCompany(context)

        // Sanity check the links don't yet exist
        // `...not.toBe(expect.anything())` allows null and undefined values
        expect(company.location).not.toBe(expect.anything())
        expect(location.company).not.toBe(expect.anything())

        await mutation(context).updateLocation({
          where: { id: location.id },
          data: { company: { connect: { id: company.id } } },
          query: 'id',
        })

        const { Company, Location } = await getCompanyAndLocation(context, company.id, location.id)
        // Everything should now be connected
        expect(Company.location.id.toString()).toBe(Location.id.toString())
        expect(Location.company.id.toString()).toBe(Company.id.toString())
      })
    )
    test(
      'With create A',
      runner(async ({ context }) => {
        const { companies } = await createInitialData(context)
        const company = companies[0]
        const locationName = sampleOne(alphanumGenerator)
        const _company = await mutation(context).updateCompany<{
          id: string
          location: { id: string; name: string | null }
        }>({
          where: { id: company.id.toString() },
          data: { location: { create: { name: locationName } } },
          query: 'id location { id name }',
        })

        const { Company, Location } = await getCompanyAndLocation(
          context,
          company.id,
          _company.location.id
        )

        // Everything should now be connected
        expect(Company.location.id.toString()).toBe(Location.id.toString())
        expect(Location.company.id.toString()).toBe(Company.id.toString())
      })
    )

    test(
      'With create B',
      runner(async ({ context }) => {
        const { locations } = await createInitialData(context)
        const location = locations[0]
        const companyName = sampleOne(alphanumGenerator)
        const _location = await mutation(context).updateLocation<{
          id: string
          company: { id: string; name: string | null }
        }>({
          where: { id: location.id.toString() },
          data: { company: { create: { name: companyName } } },
          query: 'id company { id name }',
        })
        const { Company, Location } = await getCompanyAndLocation(
          context,
          _location.company.id,
          location.id
        )

        // Everything should now be connected
        expect(Company.location.id.toString()).toBe(Location.id.toString())
        expect(Location.company.id.toString()).toBe(Company.id.toString())
      })
    )

    test(
      'With recreate A',
      runner(async ({ context }) => {
        // To begin with, nothing is linked
        const { companies } = await createInitialData(context)
        const company = companies[0]

        // Update company.location to be a new thing.
        const locationName = sampleOne(alphanumGenerator)
        const _company = await mutation(context).updateCompany<{
          id: string
          location: { id: string; name: string | null }
        }>({
          where: { id: company.id.toString() },
          data: { location: { create: { name: locationName } } },
          query: 'id location { id name }',
        })
        const { Company, Location } = await getCompanyAndLocation(
          context,
          company.id,
          _company.location.id
        )

        // Everything should now be connected
        expect(Company.location.id.toString()).toBe(Location.id.toString())
        expect(Location.company.id.toString()).toBe(Company.id.toString())

        // Keep track of the original location!
        const originalLocationId = Location.id
        await (async () => {
          const locationName = sampleOne(alphanumGenerator)
          const _company = await mutation(context).updateCompany<{
            id: string
            location: { id: string; name: string | null }
          }>({
            where: { id: company.id.toString() },
            data: { location: { create: { name: locationName } } },
            query: 'id location { id name }',
          })
          const { Company, Location } = await getCompanyAndLocation(
            context,
            company.id,
            _company.location.id
          )

          // Everything should now be connected
          expect(Company.location.id.toString()).toBe(Location.id.toString())
          expect(Location.company.id.toString()).toBe(Company.id.toString())

          const data2 = await query(context).location<{ id: string; company: { id: string } }>({
            where: { id: originalLocationId },
            query: 'id company { id }',
          })
          expect(data2.company).toBe(null)
        })()
      })
    )

    test(
      'With recreate B',
      runner(async ({ context }) => {
        const { locations } = await createInitialData(context)
        const location = locations[0]
        const companyName = sampleOne(alphanumGenerator)
        const _location = await mutation(context).updateLocation<{
          id: string
          company: { id: string; name: string | null }
        }>({
          where: { id: location.id.toString() },
          data: { company: { create: { name: companyName } } },
          query: 'id company { id name }',
        })

        const { Company, Location } = await getCompanyAndLocation(
          context,
          _location.company.id,
          location.id
        )

        // Everything should now be connected
        expect(Company.location.id.toString()).toBe(Location.id.toString())
        expect(Location.company.id.toString()).toBe(Company.id.toString())

        const originalCompanyId = Company.id
        await (async () => {
          const companyName = sampleOne(alphanumGenerator)
          const _location = await mutation(context).updateLocation<{
            id: string
            company: { id: string; name: string | null }
          }>({
            where: { id: location.id.toString() },
            data: { company: { create: { name: companyName } } },
            query: 'id company { id name }',
          })
          const { Company, Location } = await getCompanyAndLocation(
            context,
            _location.company.id,
            location.id
          )

          // Everything should now be connected
          expect(Company.location.id.toString()).toBe(Location.id.toString())
          expect(Location.company.id.toString()).toBe(Company.id.toString())

          const _company = await query(context).company<{ id: string; location: { id: string } }>({
            where: { id: originalCompanyId },
            query: 'id location { id }',
          })
          expect(_company.location).toBe(null)
        })()
      })
    )

    test(
      'With disconnect A',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { location, company } = await createCompanyAndLocation(context)

        // Run the query to disconnect the location from company
        const _company = await mutation(context).updateCompany<{
          id: string
          location: { id: string; name: string | null }
        }>({
          where: { id: company.id },
          data: { location: { disconnect: true } },
          query: 'id location { id name }',
        })
        expect(_company.id).toEqual(company.id)
        expect(_company.location).toBe(null)

        // Check the link has been broken
        const result = await getCompanyAndLocation(context, company.id, location.id)
        expect(result.Company.location).toBe(null)
        expect(result.Location.company).toBe(null)
      })
    )

    test(
      'With disconnect B',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { location, company } = await createLocationAndCompany(context)

        // Run the query to disconnect the location from company
        const _location = await mutation(context).updateLocation<{
          id: string
          company: { id: string; name: string | null }
        }>({
          where: { id: location.id },
          data: { company: { disconnect: true } },
          query: 'id company { id name }',
        })
        expect(_location.id).toEqual(location.id)
        expect(_location.company).toBe(null)

        // Check the link has been broken
        const result = await getCompanyAndLocation(context, company.id, location.id)
        expect(result.Company.location).toBe(null)
        expect(result.Location.company).toBe(null)
      })
    )

    test(
      'With null A',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { location, company } = await createCompanyAndLocation(context)

        // Run the query with a null operation
        const _company = await mutation(context).updateCompany<{
          id: string
          location: { id: string; name: string | null }
        }>({
          where: { id: company.id },
          data: { location: null },
          query: 'id location { id name }',
        })

        // Check that the location is still there
        expect(_company.id).toEqual(company.id)
        expect(_company.location).not.toBe(null)
        expect(_company.location.id).toEqual(location.id)
      })
    )

    test(
      'With null B',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { location, company } = await createLocationAndCompany(context)

        // Run the query with a null operation
        const _location = await mutation(context).updateLocation<{
          id: string
          company: { id: string; name: string | null }
        }>({
          where: { id: location.id },
          data: { company: null },
          query: 'id company { id name }',
        })

        // Check that the company is still there
        expect(_location.id).toEqual(location.id)
        expect(_location.company).not.toBe(null)
        expect(_location.company.id).toEqual(company.id)
      })
    )
  })

  describe('Delete', () => {
    test(
      'delete A',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { location, company } = await createCompanyAndLocation(context)

        // Run the query to disconnect the location from company
        const _company = await mutation(context).deleteCompany<{ id: string }>({
          where: { id: company.id },
          query: 'id',
        })
        expect(_company?.id).toBe(company.id)

        // Check the link has been broken
        const result = await getCompanyAndLocation(context, company.id, location.id)
        expect(result.Company).toBe(null)
        expect(result.Location.company).toBe(null)
      })
    )

    test(
      'delete B',
      runner(async ({ context }) => {
        // Manually setup a connected Company <-> Location
        const { location, company } = await createLocationAndCompany(context)

        // Run the query to disconnect the location from company
        const _location = await mutation(context).deleteLocation<{ id: string }>({
          where: { id: location.id },
          query: 'id',
        })
        expect(_location?.id).toBe(location.id)

        // Check the link has been broken
        const result = await getCompanyAndLocation(context, company.id, location.id)
        expect(result.Company.location).toBe(null)
        expect(result.Location).toBe(null)
      })
    )
  })
})
