import { getBuiltKeystoneConfigurationPath } from '../lib/createSystem'

export class ExitError extends Error {
  code: number
  constructor (code: number) {
    super(`The process exited with Error ${code}`)
    this.code = code
  }
}

// TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
export async function importBuiltKeystoneConfiguration (cwd: string) {
  try {
    return require(getBuiltKeystoneConfigurationPath(cwd)).default
  } catch (err: any) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.error('🚨 keystone build has not been run')
      throw new ExitError(1)
    }
    throw err
  }
}
