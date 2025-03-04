import type { StorageAdapter } from '@keystone-6/core/fields/types/image/utils'
import type { BaseKeystoneTypeInfo } from '@keystone-6/core/types'
import type { Readable } from 'node:stream'
import path from 'node:path'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
// @ts-expect-error
import Upload from 'graphql-upload/Upload.js'
import mime from 'mime'

async function collectStream(stream: Readable) {
  let chunks = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export function inMemoryStorageAdapter(): {
  storage: StorageAdapter<BaseKeystoneTypeInfo>
  files: Map<string, Uint8Array>
} {
  const files = new Map<string, Uint8Array>()
  return {
    files,
    storage: {
      async put(key, stream, meta) {
        if (files.has(key)) throw new Error(`${key} already exists`)
        files.set(key, await collectStream(stream))
      },
      async delete(key) {
        if (!files.has(key)) throw new Error(`${key} does not exist`)
        files.delete(key)
      },
      url(key) {
        return 'http://localhost:3000/files/' + key
      },
    },
  }
}

const testFiles = path.resolve(__dirname, 'test-files')

export function prepareTestFile(_filePath: string) {
  const filePath = path.resolve(testFiles, _filePath)
  const upload = new Upload()
  upload.resolve({
    createReadStream: () => fs.createReadStream(filePath),
    filename: path.basename(filePath),
    mimetype: mime.getType(filePath),
    encoding: 'utf-8',
  })
  return { upload }
}

export async function readTestFile(_filePath: string) {
  return await fsp.readFile(path.resolve(testFiles, _filePath))
}
