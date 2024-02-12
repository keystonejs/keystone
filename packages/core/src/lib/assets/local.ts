import fsp from 'node:fs/promises'
import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream'

import { StorageConfig } from '../../types'
import { FileAdapter, ImageAdapter } from './types'

export function localImageAssetsAPI (
  storageConfig: StorageConfig & { kind: 'local' }, storageKey: string=''
): ImageAdapter {
  return {
    async url (id, extension) {
      const generateUrl = storageConfig.generateUrl ?? (url=>url);

      if(storageConfig.serverRoute) {
        return generateUrl(`${storageConfig.serverRoute.path}/${storageKey}/${id}.${extension}`);
      }

      return generateUrl(`/${id}.${extension}`)
    },
    async upload (buffer, id, extension) {
      await fsp.writeFile(path.join(storageConfig.storagePath, `${id}.${extension}`), buffer)
    },
    async delete (id, extension) {
      try {
        await fsp.unlink(path.join(storageConfig.storagePath, `${id}.${extension}`))
      } catch (e) {
        const error = e as NodeJS.ErrnoException
        // If the file doesn't exist, we don't care
        if (error.code !== 'ENOENT') {
          throw e
        }
      }
    },
    async download(filename, stream, headers) {
      throw new Error("Not implemented yet")
    }
  }
}

export function localFileAssetsAPI (storageConfig: StorageConfig & { kind: 'local' }, storageKey: string=''): FileAdapter {
  return {
    async url (filename) {
      const generateUrl = storageConfig.generateUrl ?? (url=>url);


      if(storageConfig.serverRoute) {
        return generateUrl(`${storageConfig.serverRoute.path}/${storageKey}/${filename}`);
      }

      return generateUrl(`/${filename}`)
    },
    async upload (stream, filename) {
      const writeStream = fs.createWriteStream(path.join(storageConfig.storagePath, filename))
      const pipeStreams: Promise<void> = new Promise((resolve, reject) => {
        pipeline(stream, writeStream, err => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })

      try {
        await pipeStreams
        const { size: filesize } = await fsp.stat(path.join(storageConfig.storagePath, filename))
        return { filesize, filename }
      } catch (e) {
        await fsp.rm(path.join(storageConfig.storagePath, filename))
        throw e
      }
    },
    async delete (filename) {
      try {
        await fsp.unlink(path.join(storageConfig.storagePath, filename))
      } catch (e) {
        const error = e as NodeJS.ErrnoException
        // If the file doesn't exist, we don't care
        if (error.code !== 'ENOENT') {
          throw e
        }
      }
    },
    async download(filename, stream, headers) {
      throw new Error("Not implemented yet")
    }
  }
}
