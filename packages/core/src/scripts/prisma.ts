import { validateArtifacts } from '../artifacts'
import { ensurePrismaConfig } from '../lib/prisma-config'
import { runPrismaCommand } from '../lib/prisma-cli'
import { createSystem } from '../lib/system'
import { importBuiltKeystoneConfiguration } from './utils'

export async function prisma(cwd: string, args: string[], frozen: boolean) {
  // TODO: should build unless --frozen?
  const configArgIndex = args.findIndex(arg => arg === '--config')
  const inlineConfigArg = args.find(arg => arg.startsWith('--config='))
  const configFile =
    configArgIndex === -1 ? inlineConfigArg?.slice('--config='.length) : args[configArgIndex + 1]

  if (!configFile) await ensurePrismaConfig(cwd, frozen)
  const system = createSystem(await importBuiltKeystoneConfiguration(cwd))
  await validateArtifacts(cwd, system)
  await runPrismaCommand(cwd, args)
}
