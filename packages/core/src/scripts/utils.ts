import { getBuiltKeystoneConfigurationPath } from '../lib/createSystem'
import fs from 'node:fs/promises'

export class ExitError extends Error {
  code: number
  constructor(code: number) {
    super(`The process exited with Error ${code}`)
    this.code = code
  }
}

// TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
export async function importBuiltKeystoneConfiguration(cwd: string) {
  try {
    const builtConfigPath = getBuiltKeystoneConfigurationPath(cwd)
    if (!(await fs.stat(builtConfigPath).catch(() => null))) {
      console.error('🚨 keystone build has not been run')
      throw new ExitError(1)
    }
    return require(builtConfigPath).default
  } catch (err: any) {
    console.error('🚨 importing built keystone config failed')
    throw err
  }
}
