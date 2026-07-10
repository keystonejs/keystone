import fs from 'node:fs/promises'
import path from 'node:path'

import { ensurePrismaConfig } from '../src/lib/prisma-config'

async function scratchDirectory() {
  const root = path.join(process.cwd(), '.keystone')
  await fs.mkdir(root, { recursive: true })
  return fs.mkdtemp(path.join(root, 'prisma-config-test-'))
}

describe('prisma.config.ts', () => {
  test('scaffolds once and never overwrites application changes', async () => {
    const cwd = await scratchDirectory()
    const configPath = await ensurePrismaConfig(cwd, false)

    expect(configPath).toBe(path.join(cwd, 'prisma.config.ts'))
    expect(await fs.readFile(configPath, 'utf8')).toContain(`schema: 'schema.prisma'`)
    expect(await fs.readFile(configPath, 'utf8')).not.toContain('loadEnvFile')

    await fs.writeFile(configPath, `export default { schema: 'custom.prisma' }\n`)
    await ensurePrismaConfig(cwd, false)
    expect(await fs.readFile(configPath, 'utf8')).toBe(
      `export default { schema: 'custom.prisma' }\n`
    )
  })

  test('does not create a missing config in frozen mode', async () => {
    const cwd = await scratchDirectory()
    await expect(ensurePrismaConfig(cwd, true)).rejects.toThrow('prisma.config.ts')
    await expect(fs.stat(path.join(cwd, 'prisma.config.ts'))).rejects.toMatchObject({
      code: 'ENOENT',
    })
  })
})
