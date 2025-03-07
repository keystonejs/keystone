import { randomBytes } from 'node:crypto'
import imageSize from 'image-size'

import type { ImagesContext, KeystoneConfig } from '../../types'
import type { ImageAdapter } from './types'
import { localImageAssetsAPI } from './local'
import { s3ImageAssetsAPI } from './s3'
import { streamToBuffer } from './utils'

function defaultTransformName(path: string) {
  return randomBytes(16).toString('base64url')
}

async function getImageMetadataFromBuffer(buffer: Buffer) {
  const fileType = await (await import('file-type')).fileTypeFromBuffer(buffer)
  if (!fileType) throw new Error('File type not found')

  const { ext } = fileType
  if (ext !== 'jpg' && ext !== 'png' && ext !== 'webp' && ext !== 'gif') {
    throw new Error(`${ext} is not a supported image type`)
  }

  const { height, width } = imageSize(buffer)
  if (width === undefined || height === undefined) {
    throw new Error('Height and width could not be found for image')
  }

  return {
    width,
    height,
    filesize: buffer.length,
    extension: ext,
  } as const
}

export function createImagesContext(config: KeystoneConfig): ImagesContext {
  const imageAssetsAPIs = new Map<string, ImageAdapter>()
  for (const [storageKey, storageConfig] of Object.entries(config.storage || {})) {
    if (storageConfig.type === 'image') {
      imageAssetsAPIs.set(
        storageKey,
        storageConfig.kind === 'local'
          ? localImageAssetsAPI(storageConfig)
          : s3ImageAssetsAPI(storageConfig)
      )
    }
  }

  return (storageString: string) => {
    const adapter = imageAssetsAPIs.get(storageString)
    if (adapter === undefined) {
      throw new Error(`No file assets API found for storage string "${storageString}"`)
    }

    return {
      getUrl: async (id, extension) => {
        return adapter.url(id, extension)
      },
      getDataFromStream: async (stream, originalFilename) => {
        const storageConfig = config.storage![storageString]
        const { transformName = defaultTransformName } = storageConfig

        const buffer = await streamToBuffer(stream)
        const { extension, ...rest } = await getImageMetadataFromBuffer(buffer)

        const id = await transformName(originalFilename, extension)
        await adapter.upload(buffer, id, extension)
        return { id, extension, ...rest }
      },
      deleteAtSource: adapter.delete,
    }
  }
}
