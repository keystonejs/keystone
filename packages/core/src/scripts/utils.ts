import fs from 'node:fs/promises'

import { getBuiltKeystoneConfigurationPath } from '../lib/system'
import type { KeystoneConfig } from '../types'

export class ExitError extends Error {
  code: number
  constructor(code: number, message: string = '') {
    super(`The process exited with ${code}${message ? `: ${message}` : ''}`)
    this.code = code
    this.message = message
  }
}

// TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
export async function importBuiltKeystoneConfiguration(cwd: string): Promise<KeystoneConfig> {
  const builtConfigPath = getBuiltKeystoneConfigurationPath(cwd)
  if (!(await fs.stat(builtConfigPath).catch(() => null))) {
    throw new Error('You need to run "keystone build"')
  }
  return require(builtConfigPath).default
}
