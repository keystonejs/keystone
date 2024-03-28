import { randomBytes } from 'node:crypto'

import {
  type FilesContext,
  type __ResolvedKeystoneConfig,
} from '../../types'
import { localFileAssetsAPI } from './local'
import { s3FileAssetsAPI } from './s3'
import type { FileAdapter } from './types'

// appends a 128-bit random identifier to the filename to prevent guessing
function defaultTransformName (path: string) {
  // this regex lazily matches for any characters that aren't a new line
  // it then optionally matches the last instance of a "." symbol
  // followed by any alphanumerical character before the end of the string
  const [, name, ext] = path.match(/^([^:\n].*?)(\.[A-Za-z0-9]{0,10})?$/) as RegExpMatchArray

  const id = randomBytes(16).toString('base64url')
  const urlSafeName = name.replace(/[^A-Za-z0-9]/g, '-')
  if (ext) return `${urlSafeName}-${id}${ext}`
  return `${urlSafeName}-${id}`
}

export function createFilesContext (config: __ResolvedKeystoneConfig): FilesContext {
  const adaptersMap = new Map<string, FileAdapter>()

  for (const [storageKey, storageConfig] of Object.entries(config.storage || {})) {
    if (storageConfig.type === 'file') {
      adaptersMap.set(
        storageKey,
        storageConfig.kind === 'local'
          ? localFileAssetsAPI(storageConfig)
          : s3FileAssetsAPI(storageConfig)
      )
    }
  }

  return (storageString: string) => {
    const adapter = adaptersMap.get(storageString)
    if (!adapter) {
      throw new Error(`No file assets API found for storage string "${storageString}"`)
    }

    return {
      getUrl: async filename => {
        return adapter.url(filename)
      },
      getDataFromStream: async (stream, originalFilename) => {
        const storageConfig = config.storage![storageString]
        const { transformName = defaultTransformName } = storageConfig as (typeof storageConfig) & {
          type: 'file'
        }

        const filename = await transformName(originalFilename)
        const { filesize } = await adapter.upload(stream, filename)
        return { filename, filesize }
      },
      deleteAtSource: async filename => {
        await adapter.delete(filename)
      },
    }
  }
}
