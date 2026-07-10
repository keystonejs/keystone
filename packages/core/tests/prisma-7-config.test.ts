import { config } from '../src/schema'
import { initialiseLists } from '../src/lib/core/initialise-lists'
import { printPrismaSchema } from '../src/lib/core/prisma-schema-printer'
import { formatPrismaSchema } from '../src/lib/prisma-cli'

describe('Prisma 7 database configuration', () => {
  test('normalises a URL-free native Prisma Client options factory', () => {
    const prismaClientOptions = () => ({ adapter: { provider: 'sqlite' } })

    const resolved = config({
      db: {
        provider: 'sqlite',
        prismaClientOptions,
      },
      lists: {},
    })

    expect(resolved.db.prismaClientPath).toBe('generated/prisma')
    expect(resolved.db.prismaClientOptions).toBe(prismaClientOptions)
    expect('url' in resolved.db).toBe(false)
    expect('shadowDatabaseUrl' in resolved.db).toBe(false)
    expect('enableLogging' in resolved.db).toBe(false)
    expect(resolved.db.prismaSchemaPath).toBe('schema.prisma')
  })

  test('generates a URL-free Rust-free client schema at the resolved output', async () => {
    const resolved = config({
      db: {
        provider: 'sqlite',
        prismaClientOptions: () => ({ adapter: {} }),
      },
      lists: {},
    })

    const prismaSchema = await formatPrismaSchema(
      process.cwd(),
      printPrismaSchema(resolved, initialiseLists(resolved), '../generated/prisma')
    )

    expect(prismaSchema).toContain(`datasource sqlite {\n  provider = "sqlite"\n}`)
    expect(prismaSchema).toContain(
      `generator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}`
    )
    expect(prismaSchema).not.toContain('DATABASE_URL')
    expect(prismaSchema).not.toContain('shadowDatabaseUrl')
  })
})
